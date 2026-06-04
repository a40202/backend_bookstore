export class CreateSupportTicketDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  orderId?: string;
  priority?: 'low' | 'medium' | 'high';
}
