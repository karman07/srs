import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';

@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    @InjectModel(Teacher.name) private readonly teacherModel: Model<TeacherDocument>
  ) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  // ✅ Added API to find teachers based on branch and semester
  @Get()
  async findByBranchAndSemester(@Query('branch') branch: string, @Query('semester') semester: string) {
    const teachers = await this.teacherModel.find({
      branches: { $in: [branch] },
      semesters: { $in: [semester] },
    }).lean();

    const formattedTeachers = [];

    for (const teacher of teachers) {
      teacher.semesters.forEach((sem, index) => {
        if (sem === semester && teacher.branches[index] === branch) {
          formattedTeachers.push({
            name: `${teacher.name} (${teacher.subjects[index]})`, // Correctly maps subjects
            _id: teacher._id, // Keeps ID for reference
          });
        }
      });
    }

    return formattedTeachers;
  }
}
