
import { useContext, useEffect, useState } from 'react';
import type {
  Student,
  ClassAndSubjectTeacher,
  SchoolYearSubject,
} from '../types/response';
import { YearContext } from '../../src/context/YearProvider/YearProvider';
import teacherApi from '../apis/urlApi';
import axios from 'axios';
import mainAxios from '../apis/main-axios';
import { Button, Form, Input, Result, Select, Table, TableColumnsType, message } from 'antd';
import { EvaluteRequesDto } from 'types/request';

const { Option } = Select;
const optionSemmer = [
  {
    label: "Học kì 1",
    value: "HOC_KI_1"
  },
  {
    label: "Học kì 2",
    value: "HOC_KI_2"
  },
  {
    label: "Cả năm",
    value: "CA_NAM"
  }
]
const optionTypePoint = [
  {
    label: "Học kì",
    value: "KT_CUOI_KY"
  },
  {
    label: "Kiểm Tra Thường Xuyên",
    value: "KTTX"
  },
  {
    label: "Đểm Trung Bình",
    value: "DTB"
  },
  {
    label: "Giữa Kì",
    value: "KT_GIUA_KY"
  }
]

const EvaluateCreate = () => {
  const [student, setStudent] = useState<Student[]>([]);
  const [classId, setClassId] = useState<number>();
  const [subjects, setSubjects] = useState<SchoolYearSubject[]>([]);
  const { idYear } = useContext(YearContext);
  const [form] = Form.useForm();
  const [schoolYearClassTeacher, setSchoolYearClassTeacher] = useState<ClassAndSubjectTeacher[]>([]);
  const [semmerId, setSemmerId] = useState<string>();
  const [subjectId, setSubjectId] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [typePoint, setTypePoint] = useState<string>("");
  const [requestDto, setRequestDto] = useState<EvaluteRequesDto>({
    schoolYearClassId: classId!,
    sem: semmerId!,
    studentScoreDetails: [],
    schoolYearSubjectId: subjectId!
  });

  const fetchStudents = async () => {
    try {
      form.resetFields(["score"]);
      if (schoolYearClassTeacher !== undefined && classId !== undefined) {
        const studentRes = await mainAxios.get(`/api/v1/student/get-student-year-info-by?bySchoolYearClassId=${classId}`);
        setStudent(studentRes.data)
      }
    }
    catch (error) {
      setStudent([])
    }
  };

  const fetchSchoolYearClassData = async () => {
    if (idYear === null) return;
    try {
      const res = await teacherApi.getTeacherClasses(idYear);
      setSchoolYearClassTeacher(res?.data);
      setClassId(schoolYearClassTeacher[0]?.id)
      let s = schoolYearClassTeacher.filter((cl) => cl?.id == classId);
      s.forEach((as) => {
        setSubjects(as.subjects)
        setSubjectId(as.subjects[0]?.id);
      })
      setRequestDto({
        schoolYearClassId: classId!,
        sem: "",
        studentScoreDetails: [],
        schoolYearSubjectId: 0
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setSchoolYearClassTeacher([]);
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
  useEffect(() => {
    fetchStudents();
    changeSuject();

  }, [classId]);


  useEffect(() => {
    fetchSchoolYearClassData();
    fetchStudents();

  }, [idYear]);

  useEffect(() => {
    changeSuject();
  }, [schoolYearClassTeacher]);

  const setPoint = (point: string, id: number): void => {
    const newPointsArr = [...requestDto.studentScoreDetails];
    const existed = newPointsArr.some(npa => npa.studentYearInfoId === id);
    if (existed) {
      for (let index = 0; index < newPointsArr.length; index++) {
        const element = newPointsArr[index];
        if (element.studentYearInfoId === id) {
          element.scoreDetails[0].score = point;
          break;
        }
      }
    } else {
      const pointDetail = {
        studentYearInfoId: id,
        scoreDetails: [{
          score: point,
          pointType: typePoint
        }]
      }
      newPointsArr.push(pointDetail);
    }

    setRequestDto({ ...requestDto, studentScoreDetails: newPointsArr });
  }

  const handleClassChange = (value: number) => {
    setClassId(value);
    setRequestDto({
      schoolYearClassId: value,
      sem: "",
      studentScoreDetails: [],
      schoolYearSubjectId: 0
    });
  };

  const handleTypePointChange = (value: string) => {
    setTypePoint(value);
    setRequestDto(prev => {
      const returnValue = { ...prev };
      returnValue.studentScoreDetails.forEach(s => s.scoreDetails[0].pointType = value);
      return returnValue;
    });
  }

  const changeSuject = () => {
    let s = schoolYearClassTeacher.filter((cl) => cl.id == schoolYearClassTeacher[0].id);
    s.forEach((as) => {
      setSubjects(as.subjects)
      setSubjectId(as.subjects[0]?.id);
    })
  }


  const handleSemmerChange = (value: string) => {
    setRequestDto({ ...requestDto, sem: value });
    setSemmerId(value);
  };

  const handleSubjectTeachChange = (value: number) => {
    setRequestDto({ ...requestDto, schoolYearSubjectId: value });
  }

  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = dateObject.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    try {
      const value = form.validateFields();
      console.log("value", value);

      const res = await teacherApi.postEluate(requestDto);
      message.success("Thêm điểm thành công");
    } catch {
      message.error("Thêm điểm thất bại");
    }
  };

  const columnEvaluate: TableColumnsType<Student> = [
    {
      title: 'Stt',
      dataIndex: 'Stt',
      key: 'Stt',
      width: '2%',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'students',
      key: 'Ho_Ten',
      width: '5%',
      align: 'center',
      render: (item) => (
        <>{item.firstName} {item.lastName}</>
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'students',
      key: 'Ngay_sinh',
      width: '5%',
      align: 'center',
      render: (item) => (
        <>{formatDate(item.birthday)}</>
      )
    },
    {
      title: 'Điểm',
      dataIndex: 'students',
      key: 'Ngay_sinh',
      width: '2%',
      align: 'center',
      render: (_, record) => (
        <>
          <Form.Item name={['score', record.id]} key={record.id}
            rules={[
              {
                pattern: /^(\d+|[a-zA-Z]+)$/,
                message: "Chi duoc nhap so hoac chu !"
              }
            ]}>
            <Input placeholder="Nhập điểm" onChange={(event) => setPoint(event.target.value, record.students.id)} />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <div>
      <Form form={form}>
        <div style={{ display: 'flex', padding: '16px' }}>
          <div style={{ marginRight: '14px', display: "flex" }}>
            <Form.Item name='schoolYearClassId'>
              <Select placeholder="Chọn lớp học"
                style={{ width: 150 }} onChange={handleClassChange}>
                {schoolYearClassTeacher.map((classData, indexClass) => (
                  <Option key={indexClass} value={classData.id} IdGrade={classData.grade.id}>
                    {classData.className}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name='schoolYearSubjectId'>
              <Select placeholder="Chọn môn học"
                className='ml-1'
                style={{ width: 150 }} onChange={handleSubjectTeachChange}>
                {subjects.map((sj, indexSub) => (
                  <Option key={indexSub} value={sj.id} >
                    {sj.subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name='sem'>
              <Select placeholder="Chọn kì học"
                className='ml-1 w-[122px]'
                onChange={handleSemmerChange}
              >
                {optionSemmer.map((semesters, index) => (
                  <Option key={index} value={semesters.value}>
                    {semesters.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name='pointType'>
              <Select placeholder="Chọn loại điểm"
                className='ml-1 w-[140px]'
                onChange={handleTypePointChange}>
                {optionTypePoint.map((typePoint, indexTypePoint) => (
                  <Option key={indexTypePoint} value={typePoint.value}>
                    {typePoint.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="mx-4 border border-solid border-green-500 w-36 flex items-center justify-center rounded-md h-8">
              Tất cả: {student.length} học sinh
            </div>
          </div>
        </div>
        {
          classId ?
            <>
              <Table
                columns={columnEvaluate}
                dataSource={student}
                pagination={false}
                bordered
              />
              <div className="submit" >
                <Button type="primary" className="btn-submit" onClick={handleSubmit}>
                  Lưu Lại
                </Button>
              </div>
            </>

            : <Result className='mt-20'
              title="vui lòng chọn lớp học để thêm điểm"
            />
        }
      </Form>

    </div>
  )
}
export default EvaluateCreate;