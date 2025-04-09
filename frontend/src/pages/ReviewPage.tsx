import React, {useState} from 'react';
import {FaStar} from 'react-icons/fa';
import {Separator} from '../components/ui';

interface ReviewPageProps {
    propertyName?: string;
    bookingId?: string;
}

const ReviewPage: React.FC<ReviewPageProps> = ({
                                                   propertyName = "Hotel California",
                                                   bookingId = "BK123456789"
                                               }) => {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({rating, review, bookingId});
        // Here you would typically send the data to your backend
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white p-4 md:p-8 flex flex-col items-center justify-center">
                <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h1 className="text-xl md:text-2xl font-semibold text-[#1C1C57] mb-6 text-center">Thank You for Your
                        Review!</h1>
                    <p className="text-center text-[#5D5D5D] mb-6">
                        Your feedback helps us improve our services and assists other travelers in making informed
                        decisions.
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-[#1C1C57] text-white px-6 py-2 rounded text-sm hover:bg-[#2a2a7a] transition-colors"
                        >
                            RETURN TO HOME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-xl md:text-2xl font-semibold text-[#1C1C57] mb-2">Review Your Stay</h1>
                <p className="text-[#5D5D5D] mb-6">
                    Share your experience at {propertyName} (Booking ID: {bookingId})
                </p>

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Section */}
                        <div>
                            <h2 className="text-lg font-medium text-[#1C1C57] mb-4">Rate Your Overall Experience</h2>
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <label key={index} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name="rating"
                                                value={ratingValue}
                                                onClick={() => setRating(ratingValue)}
                                                className="hidden"
                                            />
                                            <FaStar
                                                size={32}
                                                color={ratingValue <= (hover || rating) ? "#FFD700" : "#e4e5e9"}
                                                onMouseEnter={() => setHover(ratingValue)}
                                                onMouseLeave={() => setHover(0)}
                                                className="transition-colors duration-200"
                                            />
                                        </label>
                                    );
                                })}
                                <span className="ml-4 text-[#5D5D5D]">
                  {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                </span>
                            </div>
                        </div>

                        <Separator className="h-[0.0625rem] bg-[#C1C2C2]"/>

                        {/* Review Text Section */}
                        <div>
                            <h2 className="text-lg font-medium text-[#1C1C57] mb-4">Share Your Experience</h2>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Tell us about your stay... What did you like or dislike? Would you recommend this property to others?"
                                className="w-full h-40 p-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C1C57] resize-none"
                            />
                            <p className="text-xs text-[#5D5D5D] mt-2">
                                Your review helps other travelers and helps us improve our services.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="text-primary text-sm order-2 sm:order-1 cursor-pointer"
                            >
                                BACK TO CONFIRMATION
                            </button>
                            <button
                                type="submit"
                                disabled={rating === 0}
                                className={`bg-primary text-white px-6 py-2 rounded text-sm order-1 sm:order-2 ${
                                    rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a2a7a]'
                                } transition-colors`}
                            >
                                SUBMIT REVIEW
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;
