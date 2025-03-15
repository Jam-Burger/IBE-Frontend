
const ErrorComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-100 text-red-700 rounded-2xl shadow-md w-full max-w-md mx-auto">
        <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        />
      
      <p className="text-sm text-center mt-1">{  "Something went wrong. Please try again."}</p>
      
    </div>
  );
};

export default ErrorComponent;
