import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  PUPRIME_SIGNUP_LINK,
  MYFXBOOK_URL,
  CHANNEL_URL,
  BOT_TRADING_URL,
  VIDEO_GUIDES,
} from '../common/constants';

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

  async generateResponse(context: { templateText: string }): Promise<string> {
    return context.templateText;
  }

  async generateDepositRecommendation(profitTarget: number, _userName?: string, isVip?: boolean): Promise<string> {
    const minDeposit = Math.round(profitTarget / 0.8);
    const recommended = Math.min(profitTarget, Math.round(profitTarget / 0.5));
    let text = `Với mục tiêu $${profitTarget.toLocaleString()}/tháng, có thể bắt đầu với $${minDeposit.toLocaleString()} - $${recommended.toLocaleString()}.`;
    if (isVip) text += '\n\n💎 Mức vốn này phù hợp tư vấn riêng. Liên hệ @KenMasterTrade.';
    return text;
  }

  /** AI Hybrid chat - tier-aware, has CTA, includes real URLs */
  async chatSupport(userMessage: string, userName?: string, tier?: string): Promise<string> {
    if (!this.model) {
      return 'Em sẽ liên hệ lại sớm. Gõ /human để nói chuyện với nhân viên.';
    }

    const tierContext = this.getTierContext(tier, userName);

    try {
      const prompt = `Bạn là trợ lý tư vấn bằng tiếng Việt cho hệ thống Copy Trading Gold (XAUUSD).

MỤC TIÊU:
- Trả lời ngắn gọn, rõ ràng, đúng trọng tâm (tối đa 3-5 câu)
- Không nói dài dòng, không giọng quảng cáo
- Không hứa hẹn lợi nhuận chắc chắn
- Không khẳng định an toàn tuyệt đối
- Giọng chuyên nghiệp, thân thiện, dễ hiểu
- Xưng "em", gọi user bằng tên "${userName || 'bạn'}"
- KHÔNG dùng markdown (**, *, #). Chỉ text thuần + emoji vừa phải.

TIER CỦA USER: ${tier || 'unknown'}
${tierContext}

LINK QUAN TRỌNG (LUÔN gửi link thật khi liên quan):
- Đăng ký: ${PUPRIME_SIGNUP_LINK}
- Myfxbook: ${MYFXBOOK_URL}
- Channel: ${CHANNEL_URL}
- Website: ${BOT_TRADING_URL}
- Mã IB: bmrtrading
- Cloudflare WARP (nếu bị chặn web): https://1.1.1.1/
- Video mở tài khoản: ${VIDEO_GUIDES.openAccount}
- Video xác minh danh tính: ${VIDEO_GUIDES.idAuth}
- Video xác minh địa chỉ: ${VIDEO_GUIDES.addressVerify}
- Video nạp Crypto: ${VIDEO_GUIDES.depositCrypto}
- Video nạp thẻ tín dụng: ${VIDEO_GUIDES.depositCreditCard}
- Video nạp ví điện tử: ${VIDEO_GUIDES.depositEWallet}
- Video nạp ngân hàng nội địa: ${VIDEO_GUIDES.depositLocalBank}
- Video nạp ngân hàng quốc tế: ${VIDEO_GUIDES.depositIntlBank}
- Video rút Crypto: ${VIDEO_GUIDES.withdrawCrypto}
- Video rút thẻ tín dụng: ${VIDEO_GUIDES.withdrawCreditCard}
- Video rút ví điện tử: ${VIDEO_GUIDES.withdrawEWallet}
- Video rút ngân hàng nội địa: ${VIDEO_GUIDES.withdrawLocalBank}
- Video rút ngân hàng quốc tế: ${VIDEO_GUIDES.withdrawIntlBank}

MẪU TRẢ LỜI THEO TÌNH HUỐNG:

"Copy Trading là gì?" → Copy Trading là hình thức tài khoản tự động sao chép lệnh từ hệ thống. Không cần trực tiếp trade. Quan trọng là setup đúng từ đầu. ${userName} muốn bắt đầu ở mức nào?

"Có lỗ không?" → Có nhé, vì đây là thị trường thật. Bên em tập trung kiểm soát rủi ro và drawdown. ${userName} có thể test nhỏ trước để trải nghiệm. Muốn bắt đầu ở mức nào?

"100$ có chạy được không?" → Có thể bắt đầu được nhé. Mức này phù hợp để test cách hệ thống vận hành trước. Khi thấy phù hợp rồi tăng dần sẽ an toàn hơn. Em gửi bước đăng ký luôn nhé? ${PUPRIME_SIGNUP_LINK}

"5k thì sao?" → Với mức vốn này, bên em thường setup theo flow riêng để tối ưu quản lý vốn tốt hơn. ${userName} có thể xem thêm kết quả thực tế trước: ${MYFXBOOK_URL} hoặc trao đổi trực tiếp với admin @KenMasterTrade.

"Nạp tiền thế nào?" → Nạp trực tiếp vào tài khoản PU Prime nhé. Có nhiều cách: Crypto, Thẻ tín dụng, Ví điện tử, Ngân hàng. Video hướng dẫn nạp Crypto: ${VIDEO_GUIDES.depositCrypto} | Thẻ tín dụng: ${VIDEO_GUIDES.depositCreditCard}

"Myfxbook ở đâu?" → ${userName} xem tại đây nhé: ${MYFXBOOK_URL}. Channel cập nhật hằng ngày: ${CHANNEL_URL}. Sau khi xem xong, em sẽ gợi ý mức setup phù hợp.

"Mã IB là gì?" → Mã IB: bmrtrading. Cách chuyển: PU Prime app → Profile → Transfer IB → Nhập bmrtrading. Nếu cần hỗ trợ, liên hệ @KenMasterTrade.

"Có an toàn không?" → Không có gì đảm bảo tuyệt đối. Quan trọng là quản lý vốn và rủi ro. ${userName} nên test trước để đánh giá. Xem kết quả thực tế: ${MYFXBOOK_URL}

"Đăng ký thế nào?" → Đăng ký qua link: ${PUPRIME_SIGNUP_LINK}. Sau đó nạp tiền và kết nối copy trading. Video hướng dẫn mở tài khoản: ${VIDEO_GUIDES.openAccount}. Nếu không truy cập được link, cài app 1.1.1.1 (Cloudflare WARP) tại https://1.1.1.1/ rồi bật Connect.

"Không vào được link / web bị chặn / không truy cập được" → Một số nhà mạng VN có thể chặn website Forex. ${userName} cài app 1.1.1.1 (Cloudflare WARP) nhé: https://1.1.1.1/. Tải về → mở app → bật Connect → truy cập lại bình thường.

"Có cần biết trade không?" → Không bắt buộc nhé. Hệ thống được thiết kế cho cả người chưa có kinh nghiệm. ${userName} chỉ cần setup và theo dõi. Em gửi hướng dẫn bắt đầu luôn nhé?

KHÔNG ĐƯỢC: Cam kết lợi nhuận, nói chắc thắng, bịa số liệu, trả lời ngoài chủ đề copy trading/risk/vốn/quy trình.
NẾU KHÔNG CHẮC: Nói rõ cần admin hỗ trợ trực tiếp, liên hệ @KenMasterTrade.

LUÔN kết thúc bằng CTA phù hợp tier.

User "${userName || 'bạn'}" hỏi: "${userMessage}"`;

      const result = await this.model.generateContent(prompt);
      return result.response.text() || 'Gõ /human để nói chuyện với nhân viên hỗ trợ.';
    } catch (error) {
      this.logger.error('Gemini chat support error', error);
      return 'Xin lỗi, có lỗi kỹ thuật. Gõ /human để nói chuyện với nhân viên hỗ trợ.';
    }
  }

  /** Detect if AI response suggests transferring to admin */
  detectAdminTransfer(userMessage: string): boolean {
    const vipSignals = [
      /\b(2k|3k|5k|10k|20k|50k|2000|3000|5000|10000|20000|50000)\b/i,
      /muốn (tư vấn|trao đổi|chat|call|gọi|hợp tác) riêng/i,
      /setup riêng/i,
      /quản lý riêng/i,
      /vốn lớn/i,
    ];
    return vipSignals.some((r) => r.test(userMessage));
  }

  private getTierContext(tier?: string, userName?: string): string {
    const name = userName || 'bạn';
    switch (tier) {
      case 'retail_low':
      case 'retail_high':
      case 'retail':
        return `NGUYÊN TẮC RETAIL: Trả lời đơn giản 2-3 câu. Kéo về flow đăng ký. CTA: "${name} muốn bắt đầu ở mức nào?" hoặc "Em gửi hướng dẫn đăng ký luôn nhé?"`;

      case 'vip':
        return `NGUYÊN TẮC VIP: Trả lời sâu hơn về risk, drawdown, setup. Nhưng cuối cùng luôn kéo về admin. CTA: "Nếu muốn, em kết nối admin để tư vấn đúng mức vốn này."`;
      case 'whale':
        return `NGUYÊN TẮC WHALE: Trả lời tổng quan, KHÔNG đi sâu. Chuyển admin ngay. CTA: "Với mức vốn này, em kết nối admin để hỗ trợ trực tiếp nhé."`;
      default:
        return `NGUYÊN TẮC MẶC ĐỊNH: Trả lời ngắn, có CTA. Kéo về flow.`;
    }
  }
}
