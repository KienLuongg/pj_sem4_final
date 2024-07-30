export interface AttendanceRequestDto {
  dayOff: Date;
  classId: number;
  listStudent: StudentRequestDto[];
}

export interface StudentRequestDto {
  studentYearInfoId?: number;
  status?: string;
  note: string;
  id?: number
}
export interface EvaluteDto {
  schoolYearSubjectId?: number,
  schoolYearClassId: number,
  sem: string,
  studentScoreDetails: {
    studentYearInfoId: number,
    scoreDetails: {
      score: string,
      pointType: string
    }[]
  }[]
}
export interface EvaluteRequesDto {
  schoolYearSubjectId?: any;
  schoolYearClassId: any;
  sem: any;
  studentScoreDetails: {
    studentYearInfoId: any;
    scoreDetails: {
      score: any;
      pointType: any;
    }[];
  }[];
}