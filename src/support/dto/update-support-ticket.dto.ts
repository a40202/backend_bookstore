export class UpdateSupportTicketDto {
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  response?: string;
}
