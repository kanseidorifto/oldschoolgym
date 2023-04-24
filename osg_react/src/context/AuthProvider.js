import { createContext, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

import axios from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import useAxios from '../hooks/useAxios.js';
const LOGIN_URL = '/user/api/token/';
const REGISTER_URL = '/user/api/';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const localTokens = localStorage.getItem('authTokens');

	const [auth, setAuth] = useState(() => (localTokens ? JSON.parse(localTokens) : null));
	const [user, setUser] = useState(() => {
		if (localTokens)
			try {
				return jwt_decode(JSON.parse(localTokens).access);
			} catch (error) {
				console.error(error);
				console.warn({ localTokens });
				localStorage.removeItem('authTokens');
				return null;
			}
	});

	const api = useAxios();
	const [initLoading, setInitLoading] = useState(true);

	const logInUser = async ({ email, password }) => {
		try {
			const response = await axios.post(LOGIN_URL, {
				email,
				password,
			});
			if (response.status === 200) {
				const access = response?.data?.access;
				const refresh = response?.data?.refresh;

				setAuth({ access, refresh });
				setUser(jwt_decode(access));
				localStorage.setItem('authTokens', JSON.stringify({ access, refresh }));
				return null;
			}
			return response;
		} catch (err) {
			return err;
		}
	};

	const registerUser = async ({
		first_name,
		last_name,
		email,
		bday,
		password,
		role,
		phone,
		gender,
	}) => {
		try {
			const response = await axios.post(REGISTER_URL, {
				first_name,
				last_name,
				email,
				bday,
				password,
				role,
				phone,
				gender,
			});
			if (response.status === 200) {
				return null;
			}
			return response;
		} catch (err) {
			return err;
		}
	};

	const logOutUser = () => {
		setAuth(null);
		setUser(null);
		localStorage.removeItem('authTokens');
	};

	const loadUserProfile = async () => {
		try {
			const response = await axios.get('/user/api/get_user_by_id/', {
				params: { user_id: jwt_decode(auth.access).user_id },
			});
			if (response.status === 200) {
				setUser({ ...jwt_decode(auth.access), user_profile: response.data });
				console.log('setUser from loadProfile', {
					...jwt_decode(auth.access),
					user_profile: response.data,
				});
				return null;
			}
			// setInitLoading(false);
			return response;
		} catch (err) {
			return err;
		}
	};

	const contextData = {
		auth,
		setAuth,
		user,
		setUser,
		logInUser,
		registerUser,
		logOutUser,
		loadUserProfile,
	};

	useEffect(() => {
		// if (initLoading) {
		// 	updateToken();
		// }

		// const repeatTime = 25 * 1000;
		// const interval = setInterval(() => {
		// 	if (auth) {
		// 		updateToken();
		// 	}
		// }, repeatTime);

		// return () => clearInterval(interval);
		if (auth) {
			// setUser(jwt_decode(auth.access));
			if (!loadUserProfile()) console.log('logout?');
			setInitLoading(false);
		} else {
			setInitLoading(false);
		}
	}, [auth]);
	// console.log({ user });
	return (
		<AuthContext.Provider value={contextData}>
			{initLoading ? <Loading /> : children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
