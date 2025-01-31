import type { Dayjs } from 'dayjs';

export type MessageType = 'mine' | 'other' | 'info' | 'admin_number-in-channel';

export type MessageJson = {
  init: boolean;
  uuid: string;
  channel: string;
  name: string;
  message: string;
  type: MessageType;
  time: Dayjs | null;
};
