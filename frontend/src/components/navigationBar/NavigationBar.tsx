import { NavLink } from "react-router-dom";
import { useSelector } from "src/root/model";
import styles from './navigationBar.m.css';

export const NavigationBar: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  // No navigation bar whatsoever for login page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  return (
    <>
      <div className={styles.navigationBar}>
        <div className={styles.organizationContainer}>
          <div className={styles.organizationIcon}>
            {organization!.name.charAt(0)}
          </div>
          <div className={styles.organizationName}>
            {organization!.name}
          </div>
          <svg className={styles.caret}>
            <path xmlns="http://www.w3.org/2000/svg" d="M11 15L6 9.91166L6.89583 9L11 13.1979L15.1042 9.0212L16 9.93286L11 15Z" />
          </svg>
        </div>
        <NavLink className={styles.newQuestion} to={'/new'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M11.3125 6.5H6.5C6.13533 6.5 5.78559 6.64487 5.52773 6.90273C5.26987 7.16059 5.125 7.51033 5.125 7.875V17.5C5.125 17.8647 5.26987 18.2144 5.52773 18.4723C5.78559 18.7301 6.13533 18.875 6.5 18.875H16.125C16.4897 18.875 16.8394 18.7301 17.0973 18.4723C17.3551 18.2144 17.5 17.8647 17.5 17.5V12.6875" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.4687 5.46972C16.604 5.33351 16.7648 5.22535 16.942 5.15143C17.1191 5.0775 17.3091 5.03928 17.5011 5.03894C17.693 5.03861 17.8831 5.07617 18.0605 5.14947C18.2379 5.22277 18.3991 5.33037 18.5349 5.4661C18.6706 5.60183 18.7782 5.76302 18.8515 5.94042C18.9248 6.11783 18.9624 6.30796 18.962 6.49991C18.9617 6.69186 18.9235 6.88186 18.8495 7.059C18.7756 7.23615 18.6675 7.39696 18.5312 7.53222L12 14.0635L9.25 14.751L9.9375 12.001L16.4687 5.46972Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div className={styles.newQuestionText}>Ask a Question</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path d="M0 15V5L6.54063 0L13 5V15H8.24688V9.0625H4.73281V15H0ZM1.21875 13.75H3.51406V7.8125H9.46563V13.75H11.7813V5.625L6.54063 1.5625L1.21875 5.625V13.75Z" fill="black" />
          </svg>
          <div className={styles.route}>Home</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/fixme'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="11" viewBox="0 0 13 11" fill="none">
            <path d="M0.920833 6.41667C0.668056 6.41667 0.451389 6.32806 0.270833 6.15083C0.0902778 5.97361 0 5.75667 0 5.5C0 5.24333 0.0902778 5.02639 0.270833 4.84917C0.451389 4.67194 0.668056 4.58333 0.920833 4.58333C1.16157 4.58333 1.36921 4.675 1.54375 4.85833C1.71829 5.04167 1.80556 5.25556 1.80556 5.5C1.80556 5.74444 1.71829 5.95833 1.54375 6.14167C1.36921 6.325 1.16157 6.41667 0.920833 6.41667ZM0.902778 1.83333C0.65 1.83333 0.436343 1.74472 0.261806 1.5675C0.0872685 1.39028 0 1.17333 0 0.916667C0 0.66 0.0872685 0.443056 0.261806 0.265833C0.436343 0.0886113 0.65 0 0.902778 0C1.15556 0 1.36921 0.0886113 1.54375 0.265833C1.71829 0.443056 1.80556 0.66 1.80556 0.916667C1.80556 1.17333 1.71829 1.39028 1.54375 1.5675C1.36921 1.74472 1.15556 1.83333 0.902778 1.83333ZM0.920833 11C0.668056 11 0.451389 10.9114 0.270833 10.7342C0.0902778 10.5569 0 10.3461 0 10.1017C0 9.845 0.0902778 9.625 0.270833 9.44167C0.451389 9.25833 0.668056 9.16667 0.920833 9.16667C1.16157 9.16667 1.36921 9.25833 1.54375 9.44167C1.71829 9.625 1.80556 9.845 1.80556 10.1017C1.80556 10.3461 1.71829 10.5569 1.54375 10.7342C1.36921 10.9114 1.16157 11 0.920833 11ZM3.61111 10.6333V9.53333H13V10.6333H3.61111ZM3.61111 6.05V4.95H13V6.05H3.61111ZM3.61111 1.46667V0.366667H13V1.46667H3.61111Z" fill="black" />
          </svg>
          <div className={styles.route}>My Tasks</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/fixme'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.08333 13C0.794444 13 0.541667 12.8917 0.325 12.675C0.108333 12.4583 0 12.2056 0 11.9167V1.08333C0 0.794444 0.108333 0.541667 0.325 0.325C0.541667 0.108333 0.794444 0 1.08333 0H11.9167C12.2056 0 12.4583 0.108333 12.675 0.325C12.8917 0.541667 13 0.794444 13 1.08333V11.9167C13 12.2056 12.8917 12.4583 12.675 12.675C12.4583 12.8917 12.2056 13 11.9167 13H1.08333ZM6.5 9.87639C6.95741 9.87639 7.39375 9.74097 7.80903 9.47014C8.22431 9.1993 8.57037 8.83519 8.84722 8.37778H11.9167V1.08333H1.08333V8.37778H4.15278C4.42963 8.83519 4.77569 9.1993 5.19097 9.47014C5.60625 9.74097 6.04259 9.87639 6.5 9.87639ZM1.08333 9.46111V11.9167H11.9167V9.46111H9.35278C9.03981 9.91852 8.63056 10.2826 8.125 10.5535C7.61944 10.8243 7.07778 10.9597 6.5 10.9597C5.92222 10.9597 5.38056 10.8243 4.875 10.5535C4.36944 10.2826 3.96019 9.91852 3.64722 9.46111H1.08333ZM1.08333 11.9167H3.64722C3.96019 11.9167 4.36944 11.9167 4.875 11.9167C5.38056 11.9167 5.92222 11.9167 6.5 11.9167C7.07778 11.9167 7.61944 11.9167 8.125 11.9167C8.63056 11.9167 9.03981 11.9167 9.35278 11.9167H11.9167H1.08333Z" fill="black" />
          </svg>
          <div className={styles.route}>Inbox</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/fixme'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8.45 1.3V5.85H2.0605L1.677 6.2335L1.3 6.6105V1.3H8.45ZM9.1 0H0.65C0.2925 0 0 0.2925 0 0.65V9.75L2.6 7.15H9.1C9.4575 7.15 9.75 6.8575 9.75 6.5V0.65C9.75 0.2925 9.4575 0 9.1 0ZM12.35 2.6H11.05V8.45H2.6V9.75C2.6 10.1075 2.8925 10.4 3.25 10.4H10.4L13 13V3.25C13 2.8925 12.7075 2.6 12.35 2.6Z" fill="black" />
          </svg>
          <div className={styles.route}>All Questions</div>
        </NavLink>
        <div className={styles.profileContainer}>
          <div className={styles.route} >Help</div>
        </div>
      </div>
    </>
  );
};