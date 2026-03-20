import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  /** Return template text directly - no AI needed */
  async generateResponse(context: { templateText: string }): Promise<string> {
    return context.templateText;
  }

  /** Return deposit recommendation as formatted text */
  async generateDepositRecommendation(profitTarget: number, _userName?: string, isVip?: boolean): Promise<string> {
    const minDeposit = Math.round(profitTarget / 0.8);
    const maxDeposit = Math.round(profitTarget / 0.5);
    const recommended = Math.min(profitTarget, maxDeposit);

    let text = `Với mục tiêu $${profitTarget.toLocaleString()}/tháng, bạn có thể bắt đầu với $${minDeposit.toLocaleString()} - $${recommended.toLocaleString()}.

📊 Ví dụ: Nạp $${recommended.toLocaleString()} → lợi nhuận $${minDeposit.toLocaleString()} - $${maxDeposit.toLocaleString()}/tháng (50-80%)

Bạn muốn sử dụng dịch vụ nào?

📊 CopyTrading → Tạo lợi nhuận 50-80% hàng tháng tự động

📡 Tín Hiệu → Theo dõi signal, tự giao dịch, kiếm tiền không giới hạn`;

    if (isVip) {
      text += '\n\n💎 Với vốn trên $5,000, bạn là khách VIP! Bấm Hỗ Trợ VIP bên dưới để được tư vấn riêng 1-1.';
    }

    return text;
  }

  /** AI support chat - only Gemini usage, for users who click Support */
  async chatSupport(userMessage: string, userName?: string): Promise<string> {
    if (!this.model) {
      return 'Đội hỗ trợ sẽ liên hệ bạn sớm. Gõ /human để nói chuyện với nhân viên.';
    }

    try {
      const prompt = `Bạn là trợ lý AI hỗ trợ của BMR Trading. Bạn giúp người dùng về dịch vụ CopyTrading và Signals trên sàn PU Prime.

VỀ BMR TRADING:
- Cung cấp CopyTrading (tự động copy lệnh, tiềm năng lợi nhuận 50-80%/tháng) và Signals (nhóm tín hiệu giao dịch)
- Sử dụng sàn PU Prime
- CopyTrading: user nạp tiền, lệnh được copy tự động từ master trader như "Red Bull X" và "BMR Scalper"
- Signals: user vào nhóm tín hiệu, nhận signal mua/bán, tự giao dịch
- Cả 2 dịch vụ hiện MIỄN PHÍ
- Link đăng ký: https://puprime.pro/forex-trading-account/?cs=bmrcopytrade
- Mã IB (Introducing Broker): bmrmaster — dùng cho user đã có tài khoản PU Prime muốn chuyển về BMR
- Cách chuyển IB: Vào app/web PU Prime → Profile → Transfer IB → Nhập mã "bmrmaster"

CÁC BƯỚC SETUP COPYTRADING:
1. Tạo tài khoản PU Prime qua link đăng ký (hoặc chuyển IB nếu đã có tài khoản)
2. Tải app PU Prime, mở "New Live Account" → Platform: "Copy Trading", Type: "Standard", Currency: "USD"
3. Sau khi được duyệt, chuyển tiền từ tài khoản Live sang tài khoản Copy Trading
4. Tìm master trader "Red Bull X" hoặc "BMR Scalper" trong Top Highest Annual Return
5. Cấu hình: Copy Mode = "Equivalent Used Margin", Risk Management = 95%, tắt Lot Rounding → Submit

CÁC BƯỚC SETUP SIGNALS:
1. Tạo tài khoản PU Prime
2. Nạp tiền
3. Vào nhóm signal BMR để nhận tín hiệu mua/bán
4. Theo dõi signal và tự giao dịch

VIDEO HƯỚNG DẪN CÓ SẴN:
- Mở tài khoản, xác minh danh tính, xác minh địa chỉ, sử dụng khuyến mãi
- Nạp tiền: Crypto, Thẻ tín dụng, Ví điện tử, Ngân hàng nội địa, Ngân hàng quốc tế
- Rút tiền: Crypto, Thẻ tín dụng, Ví điện tử, Ngân hàng nội địa, Ngân hàng quốc tế

QUY TẮC:
- Thân thiện, chuyên nghiệp, ngắn gọn (2-4 câu tối đa)
- KHÔNG BAO GIỜ cam kết lợi nhuận cụ thể. Luôn nhắc trading có rủi ro
- Chỉ trả lời về BMR Trading, CopyTrading, Signals, PU Prime, kiến thức forex cơ bản
- Câu hỏi ngoài phạm vi (crypto, chứng khoán, cá nhân...): từ chối lịch sự, hướng về trading
- Nếu không trả lời được: gợi ý gõ /human để nói chuyện với nhân viên
- Trả lời bằng tiếng Việt
- TUYỆT ĐỐI KHÔNG dùng markdown (không **, không *, không #, không backtick). Chỉ dùng text thuần.
- Dùng xuống dòng giữa các đoạn cho dễ đọc
- Dùng emoji vừa phải cho thân thiện

User "${userName || 'trader'}" hỏi: "${userMessage}"`;

      const result = await this.model.generateContent(prompt);
      return result.response.text() || 'Gõ /human để nói chuyện với nhân viên hỗ trợ.';
    } catch (error) {
      this.logger.error('Gemini chat support error', error);
      return 'Xin lỗi, có lỗi kỹ thuật. Gõ /human để nói chuyện với nhân viên hỗ trợ.';
    }
  }
}
