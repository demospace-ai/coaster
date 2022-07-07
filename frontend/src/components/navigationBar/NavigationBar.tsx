import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "src/root/model";
import styles from './navigationBar.m.css';

export const NavigationBar: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);
  const dispatch = useDispatch();
  const showNewQuestionModal = () => {
    dispatch({ type: 'showNewQuestionModal', showNewQuestionModal: true });
  };

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
        <div className={styles.newQuestion} onClick={showNewQuestionModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M11.3125 6.5H6.5C6.13533 6.5 5.78559 6.64487 5.52773 6.90273C5.26987 7.16059 5.125 7.51033 5.125 7.875V17.5C5.125 17.8647 5.26987 18.2144 5.52773 18.4723C5.78559 18.7301 6.13533 18.875 6.5 18.875H16.125C16.4897 18.875 16.8394 18.7301 17.0973 18.4723C17.3551 18.2144 17.5 17.8647 17.5 17.5V12.6875" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.4687 5.46972C16.604 5.33351 16.7648 5.22535 16.942 5.15143C17.1191 5.0775 17.3091 5.03928 17.5011 5.03894C17.693 5.03861 17.8831 5.07617 18.0605 5.14947C18.2379 5.22277 18.3991 5.33037 18.5349 5.4661C18.6706 5.60183 18.7782 5.76302 18.8515 5.94042C18.9248 6.11783 18.9624 6.30796 18.962 6.49991C18.9617 6.69186 18.9235 6.88186 18.8495 7.059C18.7756 7.23615 18.6675 7.39696 18.5312 7.53222L12 14.0635L9.25 14.751L9.9375 12.001L16.4687 5.46972Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div className={styles.newQuestionText}>Ask a Question</div>
        </div>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginTop: '1px' }}>
            <path d="M1.20765 13C0.887978 13 0.606785 12.8786 0.364071 12.6359C0.121357 12.3932 0 12.112 0 11.7924V1.20765C0 0.876139 0.121357 0.591985 0.364071 0.355191C0.606785 0.118397 0.887978 0 1.20765 0H11.7924C12.1239 0 12.408 0.118397 12.6448 0.355191C12.8816 0.591985 13 0.876139 13 1.20765V11.7924C13 12.112 12.8816 12.3932 12.6448 12.6359C12.408 12.8786 12.1239 13 11.7924 13H1.20765ZM1.20765 11.7924H11.7924V9.39481H9.23497C8.92714 9.8684 8.52755 10.2325 8.0362 10.487C7.54485 10.7416 7.03279 10.8689 6.5 10.8689C5.96721 10.8689 5.45515 10.7416 4.9638 10.487C4.47245 10.2325 4.07286 9.8684 3.76503 9.39481H1.20765V11.7924ZM6.5 9.80328C6.87887 9.80328 7.21334 9.7204 7.50342 9.55464C7.79349 9.38889 8.1102 9.08698 8.45355 8.64891C8.54827 8.54235 8.65483 8.46243 8.77322 8.40915C8.89162 8.35587 9.04554 8.32924 9.23497 8.32924H11.7924V1.20765H1.20765V8.32924H3.76503C3.95446 8.32924 4.11134 8.35292 4.23566 8.40027C4.35997 8.44763 4.46357 8.53051 4.54645 8.64891C4.8306 9.07514 5.13251 9.37409 5.45219 9.54577C5.77186 9.71744 6.12113 9.80328 6.5 9.80328Z" fill="#323232" />
          </svg>
          <div className={styles.route}>Inbox</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/tasks'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="11" viewBox="0 0 13 11" fill="none" style={{ marginTop: '2px' }}>
            <path d="M0.920833 6.41667C0.668056 6.41667 0.451389 6.32806 0.270833 6.15083C0.0902778 5.97361 0 5.75667 0 5.5C0 5.24333 0.0902778 5.02639 0.270833 4.84917C0.451389 4.67194 0.668056 4.58333 0.920833 4.58333C1.16157 4.58333 1.36921 4.675 1.54375 4.85833C1.71829 5.04167 1.80556 5.25556 1.80556 5.5C1.80556 5.74444 1.71829 5.95833 1.54375 6.14167C1.36921 6.325 1.16157 6.41667 0.920833 6.41667ZM0.902778 1.83333C0.65 1.83333 0.436343 1.74472 0.261806 1.5675C0.0872685 1.39028 0 1.17333 0 0.916667C0 0.66 0.0872685 0.443056 0.261806 0.265833C0.436343 0.0886113 0.65 0 0.902778 0C1.15556 0 1.36921 0.0886113 1.54375 0.265833C1.71829 0.443056 1.80556 0.66 1.80556 0.916667C1.80556 1.17333 1.71829 1.39028 1.54375 1.5675C1.36921 1.74472 1.15556 1.83333 0.902778 1.83333ZM0.920833 11C0.668056 11 0.451389 10.9114 0.270833 10.7342C0.0902778 10.5569 0 10.3461 0 10.1017C0 9.845 0.0902778 9.625 0.270833 9.44167C0.451389 9.25833 0.668056 9.16667 0.920833 9.16667C1.16157 9.16667 1.36921 9.25833 1.54375 9.44167C1.71829 9.625 1.80556 9.845 1.80556 10.1017C1.80556 10.3461 1.71829 10.5569 1.54375 10.7342C1.36921 10.9114 1.16157 11 0.920833 11ZM3.61111 10.6333V9.53333H13V10.6333H3.61111ZM3.61111 6.05V4.95H13V6.05H3.61111ZM3.61111 1.46667V0.366667H13V1.46667H3.61111Z" fill="#323232" />
          </svg>
          <div className={styles.route}>My Tasks</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/allquestions'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8.45 1.3V5.85H2.0605L1.677 6.2335L1.3 6.6105V1.3H8.45ZM9.1 0H0.65C0.2925 0 0 0.2925 0 0.65V9.75L2.6 7.15H9.1C9.4575 7.15 9.75 6.8575 9.75 6.5V0.65C9.75 0.2925 9.4575 0 9.1 0ZM12.35 2.6H11.05V8.45H2.6V9.75C2.6 10.1075 2.8925 10.4 3.25 10.4H10.4L13 13V3.25C13 2.8925 12.7075 2.6 12.35 2.6Z" fill="#323232" />
          </svg>
          <div className={styles.route}>All Questions</div>
        </NavLink>
        <div className={styles.helpContainer}>
          <div className={styles.route} >Help</div>
        </div>
      </div>
    </>
  );
};