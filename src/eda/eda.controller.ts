import { Controller, Get, Param } from '@nestjs/common';
import { EdaService } from './eda.service';
import { Eda } from './schemas/eda.schema';

@Controller('eda')
export class EdaController {
  constructor(private readonly edaService: EdaService) {}

  @Get(':teacherId/:subject/:branch')
  async getEda(
    @Param('teacherId') teacherId: string,
    @Param('subject') subject: string,
    @Param('branch') branch: string,
  ): Promise<Eda> {
    return this.edaService.getEda(teacherId, subject, branch);
  }
}
