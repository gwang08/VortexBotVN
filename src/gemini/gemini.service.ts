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
      this.model = genAI.getGenerativeModel({ model: 'gemini-disabled' });
    }
  }

  async generateResponse(context: {
    userMessage?: string;
    currentStep: string;
    userName?: string;
    profitTarget?: number;
    templateText: string;
  }): Promise<string> {
    if (!this.model) {
      return context.templateText;
    }

    try {
      const systemPrompt = `Bạn là VortexBot, một trợ lý giao dịch thân thiện và chuyên nghiệp của BMR Master Trade.
Công việc của bạn là hướng dẫn người dùng thiết lập dịch vụ CopyTrading hoặc Tín Hiệu (Signals) với sàn PuPrime.

QUY TẮC QUAN TRỌNG:
- Giữ câu trả lời ngắn gọn (tối đa 2-4 câu cho phần hội thoại)
- Luôn giữ nguyên các link, mã IB, URL video từ template - KHÔNG BAO GIỜ thay đổi chúng
- Nhiệt tình nhưng chuyên nghiệp về cơ hội giao dịch
- Nếu người dùng hỏi lạc đề, trả lời ngắn gọn rồi quay lại bước hiện tại
- Sử dụng tiếng Việt tự nhiên, thân thiện
- Giữ tất cả emoji và định dạng từ template
- Template chứa thông tin BẮT BUỘC phải có trong câu trả lời
- Bạn có thể diễn đạt lại template một cách tự nhiên nhưng PHẢI giữ nguyên tất cả URL, mã và dữ liệu quan trọng

Ngữ cảnh hiện tại:
- Tên người dùng: ${context.userName || 'trader'}
- Bước hiện tại: ${context.currentStep}
- Mục tiêu lợi nhuận: ${context.profitTarget ? '$' + context.profitTarget + '/tháng' : 'chưa đặt'}
${context.userMessage ? `- Người dùng vừa nói: "${context.userMessage}"` : ''}

Nội dung template cần truyền đạt (giữ nguyên link/dữ liệu, diễn đạt tự nhiên bằng tiếng Việt):
${context.templateText}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = result.response.text();
      return response || context.templateText;
    } catch (error) {
      this.logger.error('Gemini API error, falling back to template', error);
      return context.templateText;
    }
  }

  async handleFreeText(context: {
    userMessage: string;
    currentStep: string;
    userName?: string;
    availableActions: string[];
  }): Promise<string> {
    if (!this.model) {
      return `Tôi hiểu! Hiện tại bạn đang ở: ${context.currentStep}. Vui lòng sử dụng các nút bên dưới để tiếp tục.`;
    }

    try {
      const prompt = `Bạn là VortexBot, trợ lý giao dịch. Người dùng gửi tin nhắn văn bản thay vì nhấn nút.

Người dùng: "${context.userMessage}"
Bước hiện tại: ${context.currentStep}
Các hành động có sẵn (nút): ${context.availableActions.join(', ')}

Trả lời ngắn gọn bằng tiếng Việt, xác nhận những gì người dùng nói (1 câu), sau đó hướng dẫn họ sử dụng các nút có sẵn để tiếp tục. Giữ thân thiện và ngắn gọn.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text() || `Vui lòng sử dụng các nút bên dưới để tiếp tục.`;
    } catch {
      return `Vui lòng sử dụng các nút bên dưới để tiếp tục.`;
    }
  }

  async generateDepositRecommendation(profitTarget: number, userName?: string): Promise<string> {
    const templateText = this.getDepositTemplate(profitTarget);

    if (!this.model) {
      return templateText;
    }

    try {
      const prompt = `Bạn là VortexBot, trợ lý giao dịch thân thiện. Tạo gợi ý nạp tiền bằng tiếng Việt.

Người dùng muốn kiếm $${profitTarget}/tháng lợi nhuận.
Tên người dùng: ${userName || 'trader'}

CopyTrading tạo ra lợi nhuận 50-80% hàng tháng.
Tín Hiệu (Signals) có thể tạo ra nhiều hơn nhưng cần giao dịch chủ động.

QUY TẮC:
- Gợi ý số tiền nạp TRONG hoặc DƯỚI mục tiêu của họ
- Khuyến khích và thực tế
- Cho thấy phép tính ngắn gọn: với $X nạp, CopyTrading có thể tạo ra $Y-$Z/tháng (50-80%)
- Sau đó hỏi: "Vậy bạn muốn sử dụng dịch vụ nào cùng chúng tôi, TÍN HIỆU hay CopyTrading?"
- Bao gồm mô tả:
  CopyTrading -> Tạo lợi nhuận 50-80% hàng tháng
  TÍN HIỆU -> Theo dõi và bạn có thể kiếm tiền không giới hạn, học Trading - Kỹ năng thu nhập cao nhất thế kỷ
- Giữ dưới 6 câu
- Tự nhiên và thân thiện, dùng tiếng Việt`;

      const result = await this.model.generateContent(prompt);
      return result.response.text() || templateText;
    } catch {
      return templateText;
    }
  }

  private getDepositTemplate(profitTarget: number): string {
    const minDeposit = Math.round(profitTarget / 0.8);
    const maxDeposit = Math.round(profitTarget / 0.5);
    const recommended = Math.min(profitTarget, maxDeposit);

    return `Với mục tiêu $${profitTarget.toLocaleString()}/tháng của bạn, chúng tôi khuyến nghị bắt đầu với khoản nạp khoảng $${minDeposit.toLocaleString()} - $${recommended.toLocaleString()}. Với CopyTrading, bạn có thể tạo ra lợi nhuận 50-80% hàng tháng trên khoản đầu tư.

Vậy bạn muốn sử dụng dịch vụ nào cùng chúng tôi, TÍN HIỆU hay CopyTrading?

CopyTrading -> Tạo lợi nhuận 50-80% hàng tháng

TÍN HIỆU -> Theo dõi và bạn có thể kiếm tiền không giới hạn, học Trading - Kỹ năng thu nhập cao nhất thế kỷ`;
  }
}
