import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from 'src/subscribers/schemas/subscriber.schema';
import { Model } from 'mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Controller('mail')
export class MailController {
  constructor(
    private mailerService: MailerService,
    @InjectModel(Subscriber.name) private subscriberModel: Model<Subscriber>,
    @InjectModel(Job.name)
    private readonly jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});
    console.log(subscribers);
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      const jobs = jobWithMatchingSkills.map((job) => {
        return {
          name: job.name,
          company: job.company.name,
          salary: `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
          skills: job.skills,
        };
      });

      console.log(jobs);

      await this.mailerService.sendMail({
        to: 'tiepnguyen.17102003@gmail.com',
        from: '"Recruimet Team" <support@example.com>', // override default from
        subject: 'Welcome! Confirm your Email',
        template: 'new-job',
        context: {
          receiver: subs.name,
          jobs: jobs,
        },
      });
    }
  }
}
