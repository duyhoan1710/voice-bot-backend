import { JwtGuard } from '@src/guards/jwt.guard';
import {
  CreateTransactionDto,
  GetTransactionDto,
  RechargeDto,
} from './dto/transaction.dto';
import { RolesGuard } from '@src/guards/role.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@src/common/decorators/roles.decorator';
import { ERole } from '@src/common/enums';
import { TransactionService } from './transaction.service';
import { Request } from 'express';

@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @Roles([ERole.ADMIN])
  @UseGuards(RolesGuard)
  getAllTransaction(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: GetTransactionDto,
  ) {
    const { userId, vipId, status } = query;
    return this.transactionService.getAll({ userId, vipId, status });
  }

  @Post()
  createTransaction(@Req() req: Request, @Body() body: CreateTransactionDto) {
    const userId = req.user.userId;
    const { vipId } = body;

    return this.transactionService.create({ userId, vipId });
  }

  @Post('payment-bill')
  payment(@Req() req: Request, @Body() body: RechargeDto) {
    const { comment, signature } = body;

    this.transactionService.recharge({ code: comment, signature });
  }
}
