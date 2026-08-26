import { Equals } from 'class-validator';

export class RestoreBackupDto {
  @Equals('CONFIRM')
  confirmare: string;
}
