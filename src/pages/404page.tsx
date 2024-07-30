import React from 'react';
import { Result } from 'antd';
import { NavLink } from 'react-router-dom';

const NotFound: React.FC = () => (
  <Result
    className="w-11/12 mx-auto mt-30"
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <NavLink to="/" className="bg-primary text-white p-3 rounded-md ">
        Back Home
      </NavLink>
    }
  />
);

export default NotFound;
