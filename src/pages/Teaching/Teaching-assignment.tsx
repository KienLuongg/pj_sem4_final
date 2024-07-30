import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Form, Row, Table, message, Radio } from 'antd';
import { NavLink } from 'react-router-dom';
import teacherApi from '../../apis/urlApi';
import { TeacherClassSubjectData, SchoolYearClassData, SchoolYearSubjectResponse } from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';

const AssignmentForm: React.FC = () => {
  const [form] = Form.useForm();
  const [teacherClassSubject, setTeacherClassSubject] = useState<TeacherClassSubjectData[]>([]);
  const { idYear } = useContext(YearContext);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<SchoolYearClassData[]>([]);
  const [subjects, setSubjects] = useState<SchoolYearSubjectResponse[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (idYear === null) return;
      setIsLoading(true);
      try {
        const res = await teacherApi.getTeacherSchoolYearClassSubject(idYear);
        setTeacherClassSubject(res?.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setTeacherClassSubject([]);
        } else {
          console.error('Failed to fetch school year classes:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, [idYear]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (idYear === null) return;
      setIsLoading(true);
      try {
        const res = await teacherApi.getSchoolYearClass(idYear);
        setClasses(res?.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setClasses([]);
        } else {
          console.error('Failed to fetch school year classes:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [idYear]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (idYear === null) return;
      setIsLoading(true);
      try {
        const res = await teacherApi.getSchoolYearSubject(idYear);
        setSubjects(res?.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setSubjects([]);
        } else {
          console.error('Failed to fetch school year classes:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [idYear]);

  const handleTeacherChange = (e: any) => {
    setSelectedTeacher(e.target.value);
  };

  const handleClassChange = (selectedRowKeys: React.Key[]) => {
    setSelectedClasses(selectedRowKeys.map(String));
  };

  const handleSubjectChange = (e: any) => {
    setSelectedSubject(e.target.value);
  };

  const handleSubmit = async () => {

    if (selectedTeacher === null || selectedSubject === null || selectedClasses.length === 0) {
      message.error('Please select a teacher, subject, and at least one class.');
      return;
    }
    const payload = {
      teacherSchoolYearId: Number(selectedTeacher),
      subjectClassList: [
        {
          schoolYearSubjectId: Number(selectedSubject),
          schoolYearClassId: selectedClasses.map(Number),
        },
      ],
    };
    try {
      const res = await teacherApi.postTeacherClassSubject(payload);
      message.success('Data submitted successfully!');
    } catch (error: any) {
      if (error.response) {
        message.error(`Server Error: ${error.response.data.message}`);
      } else if (error.request) {
        message.error('Network Error: Please check your connection.');
      } else {
        message.error(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item className="text-3xl text-black">
          Phân công giảng dạy
        </Breadcrumb.Item>
      </Breadcrumb>
      <Row className="flex justify-end mb-4 pr-5">
        <NavLink
          to="/assignment-list"
          className="border bg-whiter text-center text-black px-4 rounded-md mr-3 pt-0.5"
        >
          Quay lại
        </NavLink>
        <Button onClick={handleSubmit} className="px-8 bg-blue text-white">Lưu</Button>
      </Row>
      {isLoading ? (
        <Loader />
      ) : (
        <Form form={form}>
          <Row className=''>
            <Col span={8} className="">
              <Radio.Group onChange={handleTeacherChange} value={selectedTeacher}>
                <Table
                  dataSource={teacherClassSubject}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 450 }}
                  rowClassName={(record) => (selectedTeacher !== null && record.teacherSchoolYear.id === +selectedTeacher ? 'selected-row' : '')}
                >
                  <Table.Column title="Giáo viên" render={(text, record: TeacherClassSubjectData) => (
                    <Radio value={record.teacherSchoolYear.id}>{record.teacherSchoolYear.teacher.sortName}</Radio>
                  )} />
                </Table>
              </Radio.Group>
            </Col>
            <Col span={8} className="">
              <Radio.Group onChange={handleSubjectChange} value={selectedSubject}>
                <Table
                  dataSource={subjects}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 450 }}
                  rowClassName={(record) => (selectedSubject !== null && record.id === +selectedSubject ? 'selected-row' : '')}
                >
                  <Table.Column title="Môn học" render={(text, record: SchoolYearSubjectResponse) => (
                    <Radio value={record.id}>{record.subject.name}</Radio>
                  )} />
                </Table>
              </Radio.Group>
            </Col>
            <Col span={8}>
              <Table
                dataSource={classes}
                rowKey="id"
                pagination={false}
                scroll={{ y: 450 }}
                rowSelection={{
                  type: 'checkbox',
                  onChange: handleClassChange,
                  selectedRowKeys: selectedClasses.map(Number),
                }}
              >
                <Table.Column title="Lớp" render={(text, record: SchoolYearClassData) => (
                  <span>{record.className}</span>
                )} />
              </Table>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default AssignmentForm;
