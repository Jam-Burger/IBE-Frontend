export interface LandingConfigResponse {
  statusCode: string;
  message: string;
  timestamp: string;
  data: {
      tenantId: string;
      configType: string;
      updatedAt: number;
      configData: {
          pageTitle: string;
          banner: {
              enabled: boolean;
              imageUrl: string;
          };
          searchForm: {
              lengthOfStay: {
                  min: number;
                  max: number;
              };
              guestOptions: {
                  enabled: boolean;
                  min: number;
                  max: number;
                  categories: {
                      name: string;
                      enabled: boolean;
                      min: number;
                      max: number;
                      label: string;
                      default: number;
                  }[];
              };
              roomOptions: {
                  enabled: boolean;
                  min: number;
                  max: number;
                  default: number;
              };
              accessibility: {
                  enabled: boolean;
                  label: string;
              };
          };
      };
  };
}