import { Link } from 'react-router-dom';
import UserOne from '../images/user/user-01.png';
import UserTwo from '../images/user/user-02.png';
import UserThree from '../images/user/user-03.png';
import UserFour from '../images/user/user-04.png';
import UserFive from '../images/user/user-05.png';

const ChatCard = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
       Giáo Viên
      </h4>

      <div>
        <Link
          to="/"
          className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
        >
          <div className="relative h-14 w-14 rounded-full">
            <img src={UserThree} alt="User" />
            <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-meta-3"></span>
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div>
              <h5 className="font-medium text-black dark:text-white">
                Trần Thái Thông
              </h5>
              <p>
                <span className="text-sm text-black dark:text-white">
                  SĐT:

                </span>
                <span className="text-sm">0345666666</span>
              </p>
            </div>
            {/* <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-medium text-white">3</span>
            </div> */}
          </div>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
        >
          <div className="relative h-14 w-14 rounded-full">
            <img src={UserFour} alt="User" />
            <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-meta-3"></span>
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div>
              <h5 className="font-medium">Võ Thị Sáu</h5>
              <p>
                <span className="text-sm">SĐT:</span>
                <span className="text-xs"> 0987654386</span>
              </p>
            </div>
          </div>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
        >
          <div className="relative h-14 w-14 rounded-full">
            <img src={UserFive} alt="User" />
            <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-meta-6"></span>
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div>
              <h5 className="font-medium">Trần Quốc Toản</h5>
              <p>
                <span className="text-sm">SĐT:</span>
                <span className="text-xs">098799999</span>
              </p>
            </div>
          </div>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
        >
          <div className="relative h-14 w-14 rounded-full">
            <img src={UserOne} alt="User" />
            <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-meta-3"></span>
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div>
              <h5 className="font-medium text-black dark:text-white">
                Tôn Thất Thuyết
              </h5>
              <p>
                <span className="text-sm text-black dark:text-white">
                  SĐT:
                </span>
                <span className="text-xs">0986838383</span>
              </p>
            </div>
           
          </div>
        </Link>
      
      </div>
    </div>
  );
};

export default ChatCard;
