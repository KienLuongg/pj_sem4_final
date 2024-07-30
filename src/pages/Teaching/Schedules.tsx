import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Row, Col, Select, message, Modal, Form, Input, DatePicker } from 'antd';
import './Timetable.css';
import { CalendarRelease } from '../../types/response';
import mainAxios from '../../apis/main-axios';
import Loader from '../../common/Loader';
import { YearContext } from '../../context/YearProvider/YearProvider';
import NoTimetable from '../Teaching/No-schedule';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

type Day = 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

const Timetable: React.FC = () => {
  const [calendarReleases, setCalendarReleases] = useState<CalendarRelease[]>([]);
  const [selectedCalendarReleaseId, setSelectedCalendarReleaseId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { idYear } = useContext(YearContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendarReleases = async () => {
      setIsLoading(true);
      try {
        const res = await mainAxios.get(`/api/v1/schedule/get-calendar-release?schoolYearId=${idYear}`);
        const releases = res?.data || [];
        setCalendarReleases(releases);
        if (releases.length > 0) {
          setSelectedCalendarReleaseId(releases[0].id);
          const firstClassId = releases[0].schedules?.[0]?.schoolYearClassId || null;
          setClassId(firstClassId);
        } else {
          setSelectedCalendarReleaseId(null);
          setClassId(null);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setCalendarReleases([]);
        } else if (error instanceof Error) {
          console.error('Failed to fetch calendar releases:', error.message);
          message.error('Failed to fetch calendar releases.');
        } else {
          console.error('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (idYear !== null) {
      fetchCalendarReleases();
    }
  }, [idYear]);

  useEffect(() => {
    if (selectedCalendarReleaseId && classId) {
      const fetchScheduleForClass = async () => {
        setIsLoading(true);
        try {
          const res = await mainAxios.get(`/api/v1/schedule/get-schedule-by`, {
            params: {
              calendarId: selectedCalendarReleaseId,
              classId: classId,
            }
          });
          // Handle schedule data
          // Update state with fetched data if needed
        } catch (error: unknown) {
          console.error('Failed to fetch schedule data:', error);
          message.error('Failed to fetch schedule data.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchScheduleForClass();
    }
  }, [selectedCalendarReleaseId, classId]);

  const handleCalendarReleaseChange = (value: number) => {
    setSelectedCalendarReleaseId(value);
    setClassId(null);
    const selectedRelease = calendarReleases.find(cr => cr.id === value);
    if (selectedRelease) {
      const firstClassId = selectedRelease.schedules[0]?.schoolYearClassId || null;
      setClassId(firstClassId);
    }
  };

  const handleClassChange = (value: number) => {
    setClassId(value);
  };

  const getClassOptions = () => {
    if (!selectedCalendarReleaseId) return [];
    const selectedCalendarRelease = calendarReleases.find(cr => cr.id === selectedCalendarReleaseId);
    if (!selectedCalendarRelease) return [];

    const classIds = [...new Set(selectedCalendarRelease.schedules.map(schedule => schedule.schoolYearClassId))];
    return classIds.map(id => {
      const className = selectedCalendarRelease.schedules.find(schedule => schedule.schoolYearClassId === id)?.className || 'Unknown';
      return { id, className };
    });
  };

  const transformScheduleData = (schedules: any[], studyTime: 'SANG' | 'CHIEU'): any[] => {
    const transformedData: any[] = [];
    const days: Day[] = ['T2', 'T3', 'T4', 'T5', 'T6'];
    const startIndex = studyTime === 'SANG' ? 1 : 5;

    for (let i = 1; i <= 4; i++) {
      const row: any = { indexLesson: `<b>Tiết ${startIndex + i - 1}</b>` };
      days.forEach(day => {
        const lesson = schedules.find(schedule => schedule.indexLesson === startIndex + i - 1 && schedule.studyTime === studyTime && schedule.dayOfWeek === day);
        row[day.toLowerCase()] = lesson ? `<b>${lesson.subjectName}</b>` : '';
      });
      transformedData.push(row);
    }

    return transformedData;
  };

  const columns = [
    {
      title: 'Lịch',
      dataIndex: 'indexLesson',
      key: 'indexLesson',
      width: '10%',
      align: 'center' as 'center',
      render: (text: string, record: any, index: number) => (
        <div dangerouslySetInnerHTML={{ __html: text }} />
      )
    },
    {
      title: 'Thứ 2',
      dataIndex: 't2',
      key: 't2',
      width: '18%',
      align: 'center' as 'center',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    {
      title: 'Thứ 3',
      dataIndex: 't3',
      key: 't3',
      width: '18%',
      align: 'center' as 'center',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    {
      title: 'Thứ 4',
      dataIndex: 't4',
      key: 't4',
      width: '18%',
      align: 'center' as 'center',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    {
      title: 'Thứ 5',
      dataIndex: 't5',
      key: 't5',
      width: '18%',
      align: 'center' as 'center',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    {
      title: 'Thứ 6',
      dataIndex: 't6',
      key: 't6',
      width: '18%',
      align: 'center' as 'center',
      render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
  ];

  const morningColumns = columns.map(column => ({ ...column, width: '16%' }));
  const afternoonColumns = columns.map(column => ({ ...column, width: '16%' }));

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const postData = {
        title: values.className,
        schoolYearId: idYear,
        releaseAt: values.releaseAt.format(),
        sem: values.sem,
      };

      const response = await mainAxios.post('/api/v1/schedule/create-calendar-release', postData);

      if (response.status === 201) {
        const { id: calendarReleaseId } = response.data;
        message.success('Thời khóa biểu đã được tạo thành công');
        setIsModalVisible(false);
        navigate(`/create-schedule/${calendarReleaseId}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  const handleApplyCalendarRelease = async () => {
    if (selectedCalendarReleaseId) {
      try {
        const response = await mainAxios.post(`/api/v1/schedule/apply-calendar-release?calendarId=${selectedCalendarReleaseId}`
        );
        if (response.status === 200) {
          message.success('Đợt áp dụng thời khoá biểu đã được thông báo');
        }
      } catch (error) {
        console.error('Failed to apply calendar release:', error);
      }
    }
  };

  const handleDeleteClick = async () => {
    if (selectedCalendarReleaseId) {
      try {
        await mainAxios.post(`/api/v1/schedule/delete-calendar-release?calendarId=${selectedCalendarReleaseId}`);
        setCalendarReleases(calendarReleases.filter(release => release.id !== selectedCalendarReleaseId));
        message.success('Đợt áp dụng đã được xoá thành công');
        setSelectedCalendarReleaseId(null);
        setClassId(null);
      } catch (error) {
        console.error('Failed to delete calendar release:', error);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!calendarReleases || calendarReleases.length === 0) {
    return <NoTimetable />;
  }

  const selectedCalendarRelease = calendarReleases.find(cr => cr.id === selectedCalendarReleaseId);
  const schedulesForClass = selectedCalendarRelease ? selectedCalendarRelease.schedules.filter(schedule => schedule.schoolYearClassId === classId) : [];
  const morningData = transformScheduleData(schedulesForClass, 'SANG');
  const afternoonData = transformScheduleData(schedulesForClass, 'CHIEU');

  return (
    <div className="timetable-container">
      <Row justify="space-between" align="middle" className="timetable-selectors" gutter={[16, 16]}>
        <Col span={12}>
          <Row gutter={[16, 16]}>
            <Col>
              <Select
                value={selectedCalendarReleaseId}
                style={{ width: 150 }}
                onChange={handleCalendarReleaseChange}
                placeholder="Chọn đợt áp dụng"
              >
                {calendarReleases.map(cr => (
                  <Option key={cr.id} value={cr.id}>
                    {cr.title}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                value={classId}
                style={{ width: 150 }}
                onChange={handleClassChange}
                placeholder="Chọn lớp"
                disabled={!selectedCalendarReleaseId}
              >
                {getClassOptions().map(({ id, className }) => (
                  <Option key={id} value={id}>
                    {className}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button className="bg-bodydark2 ml-5" type="primary" onClick={showModal}>
            Tạo mới
          </Button>
          <Button className="bg-bodydark2 ml-5" type="primary" onClick={handleDeleteClick}>
            Xoá
          </Button>
          <Button className="ml-5" type="primary" onClick={handleApplyCalendarRelease}>
            Thông báo
          </Button>
        </Col>
      </Row>

      {selectedCalendarReleaseId && classId ? (
        <>
          <h2 className="mb-3 text-lg">Buổi sáng</h2>
          <Table
            columns={morningColumns}
            dataSource={morningData}
            pagination={false}
            bordered
            rowClassName={(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
          />

          <h2 className="mb-3 mt-3 text-lg">Buổi chiều</h2>
          <Table
            columns={afternoonColumns}
            dataSource={afternoonData}
            pagination={false}
            bordered
            rowClassName={(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
          />
        </>
      ) : (
        <p className="mt-3">Vui lòng chọn đợt áp dụng và lớp để xem thời khóa biểu.</p>
      )}

      <Modal
        title="Tạo đợt áp dụng thời khoá biểu"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Xác nhận
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Form.Item
            label="Tên thời khoá biểu"
            name="className"
            rules={[
              { required: true, message: 'Vui lòng nhập tên thời khoá biểu!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày áp dụng"
            name="releaseAt"
            rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng!' }]}
          >
            <DatePicker className="w-full" showTime />
          </Form.Item>
          <Form.Item
            label="Học kỳ"
            name="sem"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select placeholder="Chọn học kỳ">
              <Option value="HOC_KI_1">Học kỳ 1</Option>
              <Option value="HOC_KI_2">Học kỳ 2</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Timetable;
