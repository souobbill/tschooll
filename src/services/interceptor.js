import axios from 'axios';
// import {getAuthToken} from "Helpers/tokens";

const addToken = () => {
    axios.interceptors.request.use(
        async (config) => {
            try {
                // Get auth token
                const accessToken = JSON.parse(localStorage.getItem("token"));
                const tenant = JSON.parse(localStorage.getItem("tenant"+JSON.parse(localStorage.getItem("user")).id));

                if (accessToken) {
                    config.headers['Authorization'] = 'Bearer ' + accessToken;
                }

                if (!config.url.toString().includes('teacher-profile/email') && !(config.url.toString().includes('teacher-profile') && config.method== 'patch')) {
                    if (tenant) {
                        config.headers['TenantKey'] = tenant;
                    }
                    // config.headers['TenantKey'] = 'alpha';
                }

                // config.headers['Content-Type'] = 'application/json';
                return config;
            } catch (e) {
                console.log('ERROR => ', e)
                return config;
            }

        },
        error => Promise.reject(error));

    axios.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            if (error) {
                if (error.response) {
                    switch (error.response.status) {
                        case 401 || 500:
                            localStorage.removeItem("token");
                            // localStorage.removeItem("email");
                            // localStorage.removeItem("tenant");
                            localStorage.removeItem("expireAt");
                            localStorage.removeItem("user");
                            window.location.reload(true);
                            return Promise.reject(error);
                        default:
                            return Promise.reject(error);
                    }
                }
            }

            return Promise.reject(error);
        });
}


export default addToken;
