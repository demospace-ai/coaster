type IconProps = {
  className?: string;
  strokeWidth?: string;
  onClick?: () => void;
};

export const SaveIcon: React.FC<IconProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 48 48' className={props.className} {...props}>
      <path d="M42 13.85V39q0 1.2-.9 2.1-.9.9-2.1.9H9q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h25.15Zm-3 1.35L32.8 9H9v30h30ZM24 35.75q2.15 0 3.675-1.525T29.2 30.55q0-2.15-1.525-3.675T24 25.35q-2.15 0-3.675 1.525T18.8 30.55q0 2.15 1.525 3.675T24 35.75ZM11.65 18.8h17.9v-7.15h-17.9ZM9 15.2V39 9Z" />
    </svg>
  );
};

export const DashboardIcon: React.FC<IconProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} {...props}>
      <path d="M4.66666 3.75C4.16066 3.75 3.75 4.28651 3.75 4.94756V11.0684C3.75 11.386 3.84658 11.6906 4.01848 11.9152C4.19039 12.1398 4.42355 12.266 4.66666 12.266H9.55553C10.0615 12.266 10.4722 11.7295 10.4722 11.0684V4.94756C10.4722 4.28651 10.0615 3.75 9.55553 3.75H4.66666Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.66666 15.4595C4.16066 15.4595 3.75 15.996 3.75 16.657V19.0522C3.75 19.3698 3.84658 19.6741 4.01848 19.8987C4.19039 20.1233 4.42355 20.2497 4.66666 20.2497H9.55553C10.0615 20.2497 10.4722 19.7132 10.4722 19.0522V16.657C10.4722 15.996 10.0615 15.4595 9.55553 15.4595H4.66666Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.4445 20.25C13.9385 20.25 13.5278 19.7135 13.5278 19.0524V12.9316C13.5278 12.614 13.6244 12.3094 13.7963 12.0848C13.9682 11.8602 14.2014 11.734 14.4445 11.734H19.3333C19.8393 11.734 20.25 12.2705 20.25 12.9316V19.0524C20.25 19.7135 19.8393 20.25 19.3333 20.25H14.4445Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.4445 8.54052C13.9385 8.54052 13.5278 8.00401 13.5278 7.34296V4.94783C13.5278 4.63022 13.6244 4.32587 13.7963 4.10128C13.9682 3.8767 14.2014 3.75027 14.4445 3.75027H19.3333C19.8393 3.75027 20.25 4.28678 20.25 4.94783V7.34296C20.25 8.00401 19.8393 8.54052 19.3333 8.54052H14.4445Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const QuestionCircleIcon: React.FC<IconProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} {...props}>
      <path xmlns="http://www.w3.org/2000/svg" d="M9.97924 8.21256C10.9846 7.33251 12.616 7.33251 13.6214 8.21256C14.6276 9.09261 14.6276 10.5196 13.6214 11.3996C13.4471 11.5533 13.2522 11.6795 13.0461 11.7791C12.4065 12.0891 11.8012 12.6369 11.8012 13.3478V13.9917M20.5 12C20.5 13.1162 20.2801 14.2215 19.853 15.2528C19.4258 16.2841 18.7997 17.2211 18.0104 18.0104C17.2211 18.7997 16.2841 19.4258 15.2528 19.853C14.2215 20.2801 13.1162 20.5 12 20.5C10.8838 20.5 9.77846 20.2801 8.74719 19.853C7.71592 19.4258 6.77889 18.7997 5.98959 18.0104C5.20029 17.2211 4.57419 16.2841 4.14702 15.2528C3.71986 14.2215 3.5 13.1162 3.5 12C3.5 9.74566 4.39553 7.58365 5.98959 5.98959C7.58365 4.39553 9.74566 3.5 12 3.5C14.2543 3.5 16.4163 4.39553 18.0104 5.98959C19.6045 7.58365 20.5 9.74566 20.5 12ZM11.8003 16.5675H11.8072V16.5743H11.8003V16.5675Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const BoxLeftIcon: React.FC<IconProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} {...props}>
      <path d="M15.5014 15.0013L12.5002 12L15.5014 8.99878" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.49856 8.99878V15.0013" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.99622 16.0016V7.9983C2.99622 5.23572 5.23572 2.99622 7.9983 2.99622H16.0016C18.7642 2.99622 21.0037 5.23572 21.0037 7.9983V16.0016C21.0037 18.7642 18.7642 21.0037 16.0016 21.0037H7.9983C5.23572 21.0037 2.99622 18.7642 2.99622 16.0016Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const BoxRightIcon: React.FC<IconProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} {...props}>
      <path d="M8.4986 15.0013L11.4998 12L8.4986 8.99878" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5014 8.99878V15.0013" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.0038 16.0016V7.9983C21.0038 5.23572 18.7643 2.99622 16.0017 2.99622H7.9984C5.2358 2.99622 2.9963 5.23572 2.9963 7.9983V16.0016C2.9963 18.7642 5.2358 21.0037 7.9984 21.0037H16.0017C18.7643 21.0037 21.0038 18.7642 21.0038 16.0016Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};