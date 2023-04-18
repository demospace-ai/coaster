type IconProps = {
  className?: string;
  strokeWidth?: string;
  onClick?: () => void;
};

export const GoogleIcon: React.FC<IconProps> = props => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_202_2)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6 10.2271C19.6 9.518 19.5363 8.83619 19.4182 8.18164H10V12.0498H15.3818C15.15 13.2998 14.4454 14.3589 13.3863 15.0681V17.5771H16.6182C18.5091 15.8362 19.6 13.2725 19.6 10.2271Z" fill="#4285F4" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C12.7 20 14.9637 19.1046 16.6182 17.5772L13.3863 15.0681C12.4909 15.6681 11.3454 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40454 11.9H1.06364V14.4909C2.70909 17.759 6.09091 20 10 20Z" fill="#34A853" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.40454 11.9001C4.20454 11.3001 4.09091 10.6592 4.09091 10.0001C4.09091 9.34098 4.20454 8.70007 4.40454 8.10007V5.50916H1.06364C0.386363 6.85916 0 8.38643 0 10.0001C0 11.6137 0.386363 13.141 1.06364 14.491L4.40454 11.9001Z" fill="#FBBC05" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3.97728C11.4682 3.97728 12.7863 4.48182 13.8228 5.47272L16.6909 2.60454C14.9591 0.990909 12.6954 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40454 8.1C5.19091 5.73637 7.39545 3.97728 10 3.97728Z" fill="#EA4335" />
      </g>
      <defs>
        <clipPath id="clip0_202_2">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const GoogleWhiteIcon: React.FC<IconProps> = props => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_203_2)">
        <path d="M19.6 10.2272C19.6 9.51813 19.5364 8.83631 19.4182 8.18176H10V12.0499H15.3818C15.15 13.2999 14.4455 14.359 13.3864 15.0681V17.5772H16.6182C18.5091 15.8363 19.6 13.2727 19.6 10.2272Z" fill="white" />
        <path d="M10 20C12.7 20 14.9636 19.1046 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0228 10 16.0228C7.39545 16.0228 5.19091 14.2637 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z" fill="white" />
        <path d="M4.40455 11.8999C4.20455 11.2999 4.09091 10.659 4.09091 9.99994C4.09091 9.34085 4.20455 8.69994 4.40455 8.09994V5.50903H1.06364C0.386364 6.85903 0 8.38631 0 9.99994C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.8999Z" fill="white" />
        <path d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_203_2">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>

  );
};