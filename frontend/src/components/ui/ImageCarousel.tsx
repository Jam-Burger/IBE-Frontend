import {useEffect, useRef, useState} from "react";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {cn} from "../../lib/utils.ts";

interface ImageCarouselProps {
    images: string[];
    height?: string;
    width?: string;
    showDots?: boolean;
    showTitle?: boolean;
    title?: string;
    className?: string;
    arrowsStyle?: "default" | "large" | "transparent";
    autoRotate?: boolean;
    rotationInterval?: number;
}

const ImageCarousel = ({
                           images,
                           height = "145px",
                           width = "100%",
                           showDots = true,
                           showTitle = false,
                           title = "",
                           className = "",
                           arrowsStyle = "default",
                           autoRotate = false,
                           rotationInterval = 3000
                       }: ImageCarouselProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Set up auto-rotation
    useEffect(() => {
        if (autoRotate && images.length > 1) {
            // Clear any existing timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Set up new timer
            timerRef.current = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, rotationInterval);

            // Clean up on unmount or when props change
            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [autoRotate, images.length, rotationInterval]);

    // Pause auto-rotation when user interacts with carousel
    const pauseAutoRotation = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);

            // Resume after a delay
            timerRef.current = setTimeout(() => {
                if (autoRotate) {
                    timerRef.current = setInterval(() => {
                        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                    }, rotationInterval);
                }
            }, rotationInterval * 2); // Wait twice the interval before resuming
        }
    };

    const nextImage = () => {
        pauseAutoRotation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        pauseAutoRotation();
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    // Arrow styles based on the arrowsStyle prop
    const getArrowStyles = () => {
        switch (arrowsStyle) {
            case "large":
                return {
                    button: "bg-gray-800/50 text-white text-xl px-6 py-5",
                    icon: "text-white"
                };
            case "transparent":
                return {
                    button: "p-1",
                    icon: "text-gray-400"
                };
            default:
                return {
                    button: "bg-white/30 p-2 rounded-full",
                    icon: "text-gray-700"
                };
        }
    };

    const arrowStyles = getArrowStyles();

    return (
        <div
            className={cn("relative", className)}
            style={{height, width}}
        >
            <div
                className="w-full h-full bg-cover bg-center"
                style={{
                    backgroundImage: `url(${images[currentImageIndex]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {showTitle && title && (
                    <div className="absolute inset-0 flex items-end px-20 py-6">
                        <h1 className="text-white text-4xl font-medium">{title}</h1>
                    </div>
                )}
            </div>

            {/* Carousel Controls */}
            <button
                onClick={prevImage}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${arrowStyles.button}`}
            >
                <FaChevronLeft className={arrowStyles.icon}/>
            </button>
            <button
                onClick={nextImage}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${arrowStyles.button}`}
            >
                <FaChevronRight className={arrowStyles.icon}/>
            </button>

            {/* Image Dots */}
            {showDots && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full ${
                                index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => {
                                pauseAutoRotation();
                                setCurrentImageIndex(index);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel; 