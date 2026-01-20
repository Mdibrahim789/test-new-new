
export enum UserRole {
  MASTER = 'MASTER',
  CR = 'CR',
  STUDENT = 'STUDENT',
  VIEWER = 'VIEWER'
}

export interface RoutineItem {
  id: string;
  type: 'Online' | 'Offline';
  day: string;
  time: string;
  sub: string;
  teacher: string;
  roomOrLink: string;
}

export interface Student {
  id: string;
  name: string;
  dipSession?: string;
  phone: string;
  img?: string;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  phone: string;
  img?: string;
}

export interface Notice {
  id: string;
  date: string;
  title: string;
  desc: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  presentIDs: string[];
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  voters: string[];
}

export interface CRKey {
  name: string;
  key: string;
  permissions: string[];
}

export interface AppData {
  routine: RoutineItem[];
  student: Student[];
  teacher: Faculty[];
  notice: Notice[];
  attendance: AttendanceRecord[];
  polls: Poll[];
  subjects: { name: string; code: string; link: string }[];
  resources: { title: string; url: string }[];
  crKeys: CRKey[];
}
