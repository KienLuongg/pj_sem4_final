import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Table, Button, Row, Col, Select, message, Typography, Form } from 'antd';
import './Timetable.css';
import mainAxios from '../../apis/main-axios';
import Loader from '../../common/Loader';
import { YearContext } from '../../context/YearProvider/YearProvider';

const { Option } = Select;
const { Paragraph } = Typography;

type Day = 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
type Shift = 'morning' | 'afternoon';
type Type = 'subject' | 'teacher';

interface Schedule {
    [key: string]: {
        subject?: string;
        teacher?: string;
        teacherSchoolYearClassSubjectId?: number;
    };
}

interface SubjectForSchedule {
    id: number;
    subject: {
        id: number;
        name: string;
    };
    teacher: {
        id: number;
        name: string;
    };
}

interface Params extends Record<string, string | undefined> {
    calendarReleaseId: string;
    scheduleId: string;
}

const EditSchedule: React.FC = () => {
    const { calendarReleaseId, scheduleId } = useParams<Params>();
    const [subjectTeacher, setSubjectTeacher] = useState<SubjectForSchedule[]>([]);
    const { idYear } = useContext(YearContext);
    const [classId, setClassId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [classSchedules, setClassSchedules] = useState<{ [classId: string]: Schedule }>({});
    const [schoolYearClass, setSchoolYearClass] = useState<any[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchScheduleData = async () => {
            if (!calendarReleaseId) return;
            setIsLoading(true);
            try {
                const res = await mainAxios.get(`/api/v1/schedule/${calendarReleaseId}`);
                const schedule = res.data;
                setClassSchedules({ [schedule.classId]: schedule.scheduleDetails });
                setClassId(schedule.classId);
            } catch (error) {
                console.error('Failed to fetch schedule data:', error);
                message.error('Failed to fetch schedule data.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSubjectTeacherData = async () => {
            if (classId === null) return;
            setIsLoading(true);
            try {
                const res = await mainAxios.get(`/api/v1/schedule/get-teacher-class-subject?classId=${classId}`);
                setSubjectTeacher(res?.data || []);
            } catch (error) {
                console.error('Failed to fetch subject data:', error);
                message.error('Failed to fetch subject data.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSchoolYearClasses = async () => {
            try {
                const res = await mainAxios.get(`/api/v1/school-year-class?schoolYearId=${idYear}`);
                setSchoolYearClass(res.data);
            } catch (error) {
                console.error('Failed to fetch school year classes:', error);
            }
        };

        fetchScheduleData();
        fetchSubjectTeacherData();
        fetchSchoolYearClasses();
    }, [classId, scheduleId, idYear]);

    const handleSelectChange = (
        value: string,
        day: Day,
        lesson: number,
        shift: Shift,
        type: Type
    ) => {
        const shiftOffset = shift === 'morning' ? 0 : 4;
        const key = `${day}-${lesson + shiftOffset}`;
        let teacherSchoolYearClassSubjectId = 0;

        if (type === 'subject') {
            const selectedSubject = subjectTeacher.find(subject => subject.subject.name === value);
            if (selectedSubject) {
                teacherSchoolYearClassSubjectId = selectedSubject.id;
            }
        }

        setClassSchedules(prev => ({
            ...prev,
            [String(classId)]: {
                ...(prev[String(classId)] || {}),
                [key]: {
                    ...(prev[String(classId)]?.[key] || {}),
                    [type]: value,
                    ...(type === 'subject' && { teacherSchoolYearClassSubjectId }),
                },
            },
        }));
    };

    const renderSelect = (
        classId: number,
        day: Day,
        lesson: number,
        shift: Shift,
        type: Type
    ): JSX.Element | null => {
        const shiftOffset = shift === 'morning' ? 0 : 4;
        const key = `${day}-${lesson + shiftOffset}`;
        let options: { id: number; name: string }[] = [];

        if (type === 'subject') {
            options = subjectTeacher.map(subject => ({
                id: subject.subject.id,
                name: subject.subject.name,
            }));
        }

        if (type === 'subject') {
            return (
                <Select
                    style={{ width: 120 }}
                    value={classSchedules[classId]?.[key]?.[type]}
                    onChange={value => handleSelectChange(value, day, lesson, shift, type)}
                >
                    {options.map(option => (
                        <Option key={option.id} value={option.name}>
                            {option.name}
                        </Option>
                    ))}
                </Select>
            );
        } else if (type === 'teacher') {
            const selectedSubjectName = classSchedules[classId]?.[key]?.subject;
            const selectedSubject = subjectTeacher.find(subject => subject.subject.name === selectedSubjectName);

            return (
                <Paragraph>
                    {selectedSubject ? selectedSubject.teacher.name : ''}
                </Paragraph>
            );
        }

        return null;
    };

    const transformScheduleData = (shift: Shift): any[] => {
        const transformedData: any[] = [];
        const days: Day[] = ['T2', 'T3', 'T4', 'T5', 'T6'];

        for (let i = 1; i <= 4; i++) {
            const rowSubject: any = { indexLesson: `<b>Lesson ${i}</b> - Subject` };
            days.forEach(day => {
                rowSubject[day.toLowerCase()] = renderSelect(classId ?? 0, day, i, shift, 'subject');
            });
            transformedData.push(rowSubject);
        }

        return transformedData;
    };

    const columns = [
        {
            title: 'Day/Lesson',
            dataIndex: 'indexLesson',
            key: 'indexLesson',
            width: 100,
            align: 'center' as 'center',
            render: (text: string) => <div dangerouslySetInnerHTML={{ __html: text }} />
        },
        {
            title: 'Monday',
            dataIndex: 't2',
            key: 't2',
            align: 'center' as 'center',
        },
        {
            title: 'Tuesday',
            dataIndex: 't3',
            key: 't3',
            align: 'center' as 'center',
        },
        {
            title: 'Wednesday',
            dataIndex: 't4',
            key: 't4',
            align: 'center' as 'center',
        },
        {
            title: 'Thursday',
            dataIndex: 't5',
            key: 't5',
            align: 'center' as 'center',
        },
        {
            title: 'Friday',
            dataIndex: 't6',
            key: 't6',
            align: 'center' as 'center',
        },
    ];

    const morningData = transformScheduleData('morning');
    const afternoonData = transformScheduleData('afternoon');

    const handleSubmit = async () => {
        try {
            const scheduleDetails = Object.keys(classSchedules[String(classId)] || {}).map(key => {
                const [day, lessonStr] = key.split('-');
                const lesson = parseInt(lessonStr, 10);
                const studyTime = lesson <= 4 ? 'MORNING' : 'AFTERNOON';
                const { teacherSchoolYearClassSubjectId } = classSchedules[String(classId)][key];

                return {
                    indexLesson: lesson,
                    studyTime,
                    dayOfWeek: day.toUpperCase(),
                    note: '',
                    teacherSchoolYearClassSubjectId,
                };
            });

            const postData = {
                calendarReleaseId: parseInt(calendarReleaseId || '0', 10),
                classId,
                scheduleDetailCreate: scheduleDetails,
            };

            await mainAxios.put(`/api/v1/schedule/update-schedule`, postData);
            message.success('Schedule has been successfully updated');
        } catch (error) {
            console.error('Failed to submit form:', error);
            message.error('Error occurred while updating the schedule');
        }
    };

    const handleClassChange = (value: number) => {
        setClassId(value);
    };

    return (
        <div className="timetable-container">
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    <Row justify="space-between" align="middle" className="timetable-selectors" gutter={[16, 16]}>
                        <Col>
                            <Select
                                style={{ width: 120 }}
                                value={classId || undefined}
                                onChange={handleClassChange}
                                placeholder="Select class"
                            >
                                {schoolYearClass.map(schoolClass => (
                                    <Option key={schoolClass.id} value={schoolClass.id}>
                                        {schoolClass.className}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col>
                            <NavLink
                                to="/schedule"
                                className="border bg-whiter text-center text-black px-4 rounded-md mr-3 pt-0.5"
                            >
                                Quay lại
                            </NavLink>
                            <Button type="primary" onClick={handleSubmit}>Chỉnh sửa</Button>
                        </Col>
                    </Row>
                    <h2 className="mb-3 text-lg">Morning</h2>
                    <Table
                        columns={columns}
                        dataSource={morningData}
                        pagination={false}
                        bordered
                        rowClassName={(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
                    />
                    <h2 className="mb-3 mt-3 text-lg">Afternoon</h2>
                    <Table
                        columns={columns}
                        dataSource={afternoonData}
                        pagination={false}
                        bordered
                        rowClassName={(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
                    />
                </div>
            )}
        </div>
    );
};

export default EditSchedule;
