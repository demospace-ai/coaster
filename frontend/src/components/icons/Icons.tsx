type IconProps = {
  className?: string;
  strokeWidth?: string;
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
      <path d="M4.66666 3.75C4.16066 3.75 3.75 4.28651 3.75 4.94756V11.0684C3.75 11.386 3.84658 11.6906 4.01848 11.9152C4.19039 12.1398 4.42355 12.266 4.66666 12.266H9.55553C10.0615 12.266 10.4722 11.7295 10.4722 11.0684V4.94756C10.4722 4.28651 10.0615 3.75 9.55553 3.75H4.66666Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4.66666 15.4595C4.16066 15.4595 3.75 15.996 3.75 16.657V19.0522C3.75 19.3698 3.84658 19.6741 4.01848 19.8987C4.19039 20.1233 4.42355 20.2497 4.66666 20.2497H9.55553C10.0615 20.2497 10.4722 19.7132 10.4722 19.0522V16.657C10.4722 15.996 10.0615 15.4595 9.55553 15.4595H4.66666Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.4445 20.25C13.9385 20.25 13.5278 19.7135 13.5278 19.0524V12.9316C13.5278 12.614 13.6244 12.3094 13.7963 12.0848C13.9682 11.8602 14.2014 11.734 14.4445 11.734H19.3333C19.8393 11.734 20.25 12.2705 20.25 12.9316V19.0524C20.25 19.7135 19.8393 20.25 19.3333 20.25H14.4445Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.4445 8.54052C13.9385 8.54052 13.5278 8.00401 13.5278 7.34296V4.94783C13.5278 4.63022 13.6244 4.32587 13.7963 4.10128C13.9682 3.8767 14.2014 3.75027 14.4445 3.75027H19.3333C19.8393 3.75027 20.25 4.28678 20.25 4.94783V7.34296C20.25 8.00401 19.8393 8.54052 19.3333 8.54052H14.4445Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
};