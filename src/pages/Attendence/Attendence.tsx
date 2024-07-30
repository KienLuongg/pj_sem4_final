import { useContext, useEffect, useState } from 'react';
import { DatePicker, Select, Space, Table, Button, Checkbox, Form, message } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import mainAxios from '../../apis/main-axios';
import Loader from '../../common/Loader';
import {
  AttendenceData,
  SchoolYearClassData,
  SchoolYearClassHomeRoomTeacherData,
  Student,
} from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import teacherApi from '../../apis/urlApi';
import TextArea from 'antd/es/input/TextArea';
import { AttendanceRequestDto, StudentRequestDto } from 'types/request';
import axios from 'axios';

const { Option } = Select;
const Attendences = () => {
  const [student, setStudent] = useState<Student[]>([]);
  const [schoolYearClassHomeRoomTeacher, setschoolYearClassHomeRoomTeacher] = useState<SchoolYearClassHomeRoomTeacherData[]>([]);
  const { idYear } = useContext(YearContext);
  const [classId, setClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [dayOff, setDayOff] = useState(dayjs());
  const [disPlaySubmit, setDisplaySubmit] = useState('block');
  const [disPlayUpdate, setDisplayUpdatet] = useState('none');
  const [attendancesData, setAttendencesData] = useState<AttendenceData[]>([])

  useEffect(() => {
    fetchStudents(true);
  }, [classId]);

  useEffect(() => {
    fetchSchoolYearClassData();
  }, [idYear])

  useEffect(() => {
    if (schoolYearClassHomeRoomTeacher.length > 0) {
      setClassId(schoolYearClassHomeRoomTeacher[0].id);
    }
    else {
      setClassId(null);
    }
  }, [schoolYearClassHomeRoomTeacher]);

  useEffect(() => {
    fetchStudents(true);
  }, [dayOff]);

  const fetchStudents = async (getStudents: boolean = false): Promise<void> => {
    form.resetFields(["note"]);
    try {
      if (schoolYearClassHomeRoomTeacher !== null && classId !== null && classId !== undefined) {
        if (getStudents) {
          const studentRes = await mainAxios.get(`/api/v1/student/get-student-year-info-by?bySchoolYearClassId=${classId}`);
          if (studentRes.status === 200) {
            const attendanceRes = await teacherApi.getAttendence(classId, dayOff.format("MM/DD/YYYY"));
            if (attendanceRes.status === 200) {
              const studentData = studentRes.data;
              const attendanceData = attendanceRes.data;
              setAttendencesData(attendanceData);
              setStudent(studentData.map((sd: Student) => {
                const std: Student = sd;
                const att = attendanceData.find((att: AttendenceData) => att.studentInfo.studentYearInfoId === sd.id);
                if (att) {
                  const attData: AttendenceData = {
                    attendanceStatus: att?.attendanceStatus,
                    id: att?.id,
                    note: att?.note,
                    studentInfo: att?.studentInfo,
                    createdAt: att?.createdAt
                  };
                  std.students.attendenceData = attData;
                } else {
                  std.students.attendenceData = undefined;
                }
                return std;
              }));
            }
          }
        }
      }
    }
    catch (error) {
      setStudent([])
      console.log(message)
    }
  };

  const fetchSchoolYearClassData = async () => {
    if (idYear === null) return;
    try {
      const res = await teacherApi.getSchoolYearClassHomeRoomTeacher(idYear);
      setschoolYearClassHomeRoomTeacher(res?.data);
      setClassId(schoolYearClassHomeRoomTeacher[0]?.id);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setschoolYearClassHomeRoomTeacher([]);
        setStudent([]);
      } else if (error instanceof Error) {
        console.error('Failed to fetch school year classes:', error.message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
    finally {
      setIsLoading(false);
    }
  };


  const handleChange = (value: number) => {
    setClassId(value);
  };

const handleNoteChange = (studentId: number, note: string) => {
  setStudent(prevStudents =>
    prevStudents.map(student => {
      if (student.id === studentId) {
          return {
            ...student,
            students: {
              ...student.students,
              attendenceData: {
                ...student.students.attendenceData,
                note:note
              }
            }
        
          }
        }
      return student;
    }) as Student[]
  );
};

  const handleChangeDay = (value: any) => {
    if (value) {
      form.setFieldValue("dayOff", value);
      setDayOff(value);
      fetchStudents();
    }
  }

  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = dateObject.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCheckboxChange = (studentId: number, status: string) => {
    setStudent(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          if (status === "CO_MAT")
            return {
              ...student,
              students: {
                ...student.students,
                attendenceData: {
                  ...student.students.attendenceData,
                  attendanceStatus: "CO_MAT"
                }
              }
            };
          else if (status === "NGHI_KHONG_PHEP")
            return {
              ...student,
              students: {
                ...student.students,
                attendenceData: {
                  ...student.students.attendenceData,
                  attendanceStatus: "NGHI_KHONG_PHEP"
                }
              }
            };
          else (status === "NGHI_CO_PHEP")
          return {
            ...student,
            students: {
              ...student.students,
              attendenceData: {
                ...student.students.attendenceData,
                attendanceStatus: "NGHI_CO_PHEP"
              }
            }
          };
        }
        return student;
      }) as Student[]
    );
  };



  const columnsAttendenceByDay: TableColumnsType<Student> = [
    {
      title: 'Stt',
      dataIndex: 'Stt',
      key: 'Stt',
      width: '5%',
      align: 'center',
      render: (_, __, index) => (<>{index + 1}</>),
    },
    {
      title: 'Họ tên',
      dataIndex: 'students',
      key: 'Ho_Ten',
      width: '25%',
      align: 'center',
      render: (item) => (
        <>{item.firstName} {item.lastName}</>
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'students',
      key: 'Ngay_sinh',
      width: '14%',
      align: 'center',
      render: (item) => (
        <>{formatDate(item.birthday)}</>
      )
    }
    , {
      title: 'Có mặt',
      dataIndex: 'students',
      width: '10%',
      key: 'Co_Mat',
      align: 'center',
      render: (_, record) => (
        <Checkbox
          checked={dayjs(dayOff).isSame(dayjs(), 'day') && !record.students.attendenceData ? true : record.students.attendenceData?.attendanceStatus === "CO_MAT"}
          onChange={() => handleCheckboxChange(record.id, 'CO_MAT')}
        />
      ),
    },
    {
      title: 'Nghỉ có phép',
      dataIndex: 'students',
      width: '10%',
      key: 'Nghi_Co_Phep',
      align: 'center',
      render: (_, record) => (
        <Checkbox
          checked={record.students.attendenceData?.attendanceStatus === "NGHI_CO_PHEP"}
          onChange={() => handleCheckboxChange(record.students.id, 'NGHI_CO_PHEP')}
        />
      ),
    },
    {
      title: 'Nghỉ không phép',
      dataIndex: 'Nghi_Khong_Phep',
      width: '10%',
      key: 'Nghi_Khong_Phep',
      align: 'center',
      render: (_, record) => (
        <Checkbox
          checked={record.students.attendenceData?.attendanceStatus === "NGHI_KHONG_PHEP"}
          onChange={() => handleCheckboxChange(record.id, 'NGHI_KHONG_PHEP')}
        />
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'Ghi_Chu',
      width: '20%',
      key: 'Ghi_Chu',
      align: 'center',
      render: (_, record) => (
        <Form.Item name={['note', record.id]} key={record.id}
        initialValue={record.students?.attendenceData?.note ? record.students?.attendenceData?.note : ""}>
        <TextArea
          value={record.students.attendenceData ? record.students.attendenceData.note : ""}
          onChange={(e) => handleNoteChange(record.id, e.target.value)}
          autoSize
          defaultValue={"acvb"}
        />
      </Form.Item>
      )
    }
  ];


  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const students: StudentRequestDto[] = student.map((student, index: number) => {
        const attendanceStatus = student.students.attendenceData?.attendanceStatus || 'CO_MAT';
        const studentReq: StudentRequestDto = {
          studentYearInfoId: student.id,
          status: attendanceStatus,
          note: values.note[index]!
        };
        return studentReq;
      });

      const attendanceRequest: AttendanceRequestDto = {
        dayOff: values.dayOff,
        listStudent: students,
        classId: classId!
      }
      const res = await teacherApi.postAtendence(attendanceRequest);
      console.log(res);
      await fetchStudents();
      message.success("Điểm danh thành công");
      setDisplaySubmit('none');
      setDisplayUpdatet('block')
    } catch (errorInfo) {
      message.error('Điểm danh thất bại');
    }
  };

  const submitUpdateAtendence = async () => {
    try {
      const values = form.getFieldsValue();
      const students: StudentRequestDto[] = student.map((student, index: number) => {
        const attendanceStatus = student.students.attendenceData?.attendanceStatus || 'CO_MAT';
        const id = student.students.attendenceData?.id
        const studentReq: StudentRequestDto = {
          studentYearInfoId: student.id,
          status: attendanceStatus,
          note: values.note[index]!,
          id: id
        };
        return studentReq;
      });

      const attendanceRequest: AttendanceRequestDto = {
        dayOff: values.dayOff,
        listStudent: students,
        classId: classId!
      }
      const res = await teacherApi.postAtendence(attendanceRequest)
      console.log(res)
      await fetchStudents();
      message.success("Chỉnh sửa thành công");
    } catch (errorInfo) {
      message.error('Chỉnh Sửa thất bại');
    }
  }

  const CountStudentpresent = student.filter((st) => {
    return (st.students.attendenceData?.attendanceStatus === "CO_MAT")
  }).length

  const CountStudentSuspectedPermission = student.filter((st) => {
    return (st.students.attendenceData?.attendanceStatus === "NGHI_CO_PHEP")
  }).length

  const CountStudentSuspectedNotPermission = student.filter((st) => {
    return (st.students.attendenceData?.attendanceStatus === "NGHI_KHONG_PHEP")
  }).length

  return (
        <Form form={form}>
      <div>
        <div style={{ display: 'flex', padding: '16px' }}>
          <Form.Item className="classId" style={{ marginRight: '14px' }}>
            <Select placeholder="Chọn lớp học"
              value={classId} style={{ width: 150 }} onChange={handleChange}>
              {schoolYearClassHomeRoomTeacher.map((classData) => (
                <Option key={classData.id} value={classData.id}>
                  {classData.className}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="dayOff" name="dayOff" initialValue={dayOff}> {/* Thêm name cho Form.Item */}
            <DatePicker
              defaultValue={dayOff}
              className="h-10 w-30" onChange={handleChangeDay}
              format={'M/D/YYYY'}
              maxDate={dayjs()}
            />
          </Form.Item>

          <div className="mx-4 border border-solid border-green-500 w-36 flex items-center justify-center rounded-md h-10">
            Tất cả: {student.length}
          </div>
          <div className="border border-solid border-gray-300 w-40 flex justify-center items-center rounded-md h-10">
            Có mặt: {`${CountStudentpresent}`}
          </div>
          <div className="mx-4 border border-solid border-gray-300 w-45 rounded-md flex items-center justify-center h-10">
            Có phép: {`${CountStudentSuspectedPermission}`}
          </div>
          <div className="border border-solid border-gray-300 w-52 rounded-md flex justify-center items-center h-10">
            Không phép: {`${CountStudentSuspectedNotPermission}`}
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="list-student">
            <Table
              columns={columnsAttendenceByDay}
              dataSource={student}
              pagination={false}
              bordered
            />
          </div>
        )}
        <div className="submit" style={{ display: `${attendancesData.length > 0 ? disPlayUpdate : disPlaySubmit}` }}>
          <Button type="primary" className="btn-submit" onClick={handleSubmit}>
            Lưu Lại
          </Button>
        </div>
        <div className="submit" style={{ display: `${attendancesData.length > 0 ? disPlaySubmit : disPlayUpdate}` }}>
          <Button type="primary" className="btn-submit" onClick={submitUpdateAtendence}>
            Sửa Đổi
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Attendences;
