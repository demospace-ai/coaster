import logo from '../navigationBar/logo.png';
import './Loading.css';

export function LogoLoading({ isFullPage }: { isFullPage?: boolean; }) {

    if (isFullPage) {
        return (
            <div className="tw-h-screen tw-w-screen tw-flex tw-items-center tw-justify-center full-page-loading">
                <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-w-72 tw-h-52">
                    <img src={logo} className='tw-w-36 tw-h-36 tw-justify-center tw-items-center tw-rounded tw-flex tw-my-auto tw-select-none shimmer' alt="fabra logo" />
                    <div className="progress-bar-container tw-h-4 tw-w-full tw-mt-12 tw-rounded">
                        <div className="progress-bar tw-rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-w-64 tw-h-44">
            <img src={logo} className='tw-w-36 tw-h-36 tw-justify-center tw-items-center tw-rounded tw-flex tw-my-auto tw-select-none shimmer' alt="fabra logo" />
            <div className="progress-bar-container tw-h-4 tw-w-full tw-mt-4">
                <div className="progress-bar"></div>
            </div>
        </div>
    );
}
