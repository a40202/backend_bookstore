import { Injectable, NotFoundException } from '@nestjs/common';
import type { SupportTicket } from '../common/types';
import { mapSupportTicket } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextTicketId(): Promise<string> {
    const tickets = await this.prisma.supportTicket.findMany({
      select: { id: true },
    });
    const maxNum = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace(/^TK/, ''), 10) || 0;
      return Math.max(max, num);
    }, 0);
    return `TK${String(maxNum + 1).padStart(3, '0')}`;
  }

  async findAll(): Promise<SupportTicket[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map(mapSupportTicket);
  }

  async findOne(id: string): Promise<SupportTicket> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
    return mapSupportTicket(ticket);
  }

  async create(
    dto: CreateSupportTicketDto,
    customerId?: string,
  ): Promise<SupportTicket> {
    const created = await this.prisma.supportTicket.create({
      data: {
        id: await this.nextTicketId(),
        customerId: customerId ?? null,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        subject: dto.subject,
        message: dto.message,
        orderId: dto.orderId,
        priority: dto.priority ?? 'medium',
      },
    });
    return mapSupportTicket(created);
  }

  async update(
    id: string,
    dto: UpdateSupportTicketDto,
  ): Promise<SupportTicket> {
    try {
      const updated = await this.prisma.supportTicket.update({
        where: { id },
        data: dto,
      });
      return mapSupportTicket(updated);
    } catch {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
  }
}
