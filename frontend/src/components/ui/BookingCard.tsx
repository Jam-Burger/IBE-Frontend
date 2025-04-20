import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaCheckCircle, FaTimesCircle, FaPhone } from "react-icons/fa";
import { Button } from "./Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./Card";
import { Badge } from "./badge";
import { useNavigate } from "react-router-dom";

import { BookingType } from "../../types";

interface BookingCardProps {
  booking: BookingType;
}

const BookingCard = ({ booking }: BookingCardProps) => {
  const {
    bookingId,
    status,
    adultCount,
    childCount,
    totalCost,
    checkInDate,
    checkOutDate,
    propertyName,
    propertyAddress,
    contactNumber,
    roomTypeImage,
  } = booking;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/1/confirmation/" + bookingId);
  };

  return (
    <Card
      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300"
      style={{ borderColor: "var(--bookingcard-border)" }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img src={roomTypeImage} alt={propertyName} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col flex-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle
                  className="text-xl font-bold"
                  style={{ color: "var(--bookingcard-title)" }}
                >
                  {propertyName}
                </CardTitle>
                <div className="flex items-center mt-2" style={{ color: "var(--bookingcard-subtitle)" }}>
                  <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                  <span className="text-sm">{propertyAddress}</span>
                </div>
              </div>
              {status === "BOOKED" ? (
                <Badge
                  className="hover:bg-opacity-80"
                  style={{
                    backgroundColor: "var(--bookingcard-badge-booked)",
                    color: "var(--bookingcard-badge-booked-hover)",
                  }}
                >
                  <FaCheckCircle className="h-3.5 w-3.5 mr-1" />
                  {status}
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  style={{
                    backgroundColor: "var(--bookingcard-badge-cancelled)",
                  }}
                >
                  <FaTimesCircle className="h-3.5 w-3.5 mr-1" />
                  {status}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Dates */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <FaCalendarAlt
                  className="h-4 w-4 mr-1"
                  style={{ color: "var(--bookingcard-icon)" }}
                />
                <span className="text-sm font-medium">{new Date(checkInDate).toLocaleDateString()}</span>
              </div>
              <FaArrowRight className="h-4 w-4" style={{ color: "var(--bookingcard-subtitle)" }} />
              <div className="flex items-center">
                <FaCalendarAlt
                  className="h-4 w-4 mr-1"
                  style={{ color: "var(--bookingcard-icon)" }}
                />
                <span className="text-sm font-medium">{new Date(checkOutDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Guest Info */}
            <div className="flex items-center space-x-4" style={{ color: "var(--bookingcard-title)" }}>
              {adultCount > 0 && (
                <div className="text-sm">
                  <span className="font-semibold">Adults:</span> {adultCount}
                </div>
              )}
              {childCount > 0 && (
                <div className="text-sm">
                  <span className="font-semibold">Children:</span> {childCount}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center mt-2">
              <FaPhone
                className="h-4 w-4 mr-2"
                style={{ color: "var(--bookingcard-icon)" }}
              />
              <span className="text-sm">{contactNumber}</span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
            <div style={{ color: "var(--bookingcard-title)" }}>
              <span className="text-sm">Total Price</span>
              <p className="font-bold">{totalCost}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleClick}
              style={{
                borderColor: "var(--bookingcard-button-bg)",
                color: "var(--bookingcard-button-bg)",
                backgroundColor: "transparent",
              }}
              className="hover:bg-opacity-80"
            >
              View Details
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;
