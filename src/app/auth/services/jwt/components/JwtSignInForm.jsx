import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import useJwtAuth from '../useJwtAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import TwitterLogin from 'react-twitter-auth';
import jwtDecode from 'jwt-decode';
import { devApiLink } from 'app/configs/urlConfig';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
  password: z
    .string()
    .min(4, 'Password is too short - must be at least 4 chars.')
    .nonempty('Please enter your password.'),
});

const defaultValues = {
  email: '',
  password: '',
  remember: true,
};

function JwtSignInForm() {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { signIn } = useJwtAuth();
  const { control, formState, handleSubmit, setValue, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    setValue('email', 'admin@fusetheme.com', { shouldDirty: true, shouldValidate: true });
    setValue('password', 'admin', { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  function onSubmit(formData) {
    const { email, password } = formData;
    signIn({ email, password }).catch((error) => {
      const errorData = error.response.data;
      errorData.forEach((err) => {
        setError(err.type, {
          type: 'manual',
          message: err.message,
        });
      });
    });
  }

  const onCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const handleGoogleLoginSuccess = (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);
    console.log('Google login successful:', decoded);
    console.log('User email:', decoded.email);

    axios.post(`${devApiLink}/user/google`, {
      email: decoded.email
    }).then((response) => {
      console.log(response);
      if (response.status) {
        localStorage.setItem('currentUserData', JSON.stringify(response.status));
        window.location.href = '/wbt-dashboard';
      }
    });
  };

  const handleGoogleLoginFailure = (response) => {
    console.error('Google login failed:', response);
  };

  
  return (
    <form
      name="loginForm"
      noValidate
      className="mt-32 flex w-full flex-col justify-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Email"
            autoFocus
            type="email"
            error={!!errors.email}
            helperText={errors?.email?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Password"
            type="password"
            error={!!errors.password}
            helperText={errors?.password?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

	<div className="recaptcha-container mb-24">
	<ReCAPTCHA
		sitekey="6LcmupAqAAAAAIdQIKYM6eqomSUB5tyCXzkEy8oJ"
		onChange={onCaptchaChange}
		theme="light"
	/>
	</div>

      <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormControlLabel
                label="Remember me"
                control={<Checkbox size="small" {...field} />}
              />
            </FormControl>
          )}
        />

        <Link className="text-md font-medium" to="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <Button
        variant="contained"
        color="secondary"
        className="mt-16 w-full"
        aria-label="Sign in"
        disabled={_.isEmpty(dirtyFields) || !isValid}
        type="submit"
        size="large"
      >
        Sign in
      </Button>

      <div className="mt-20 w-full flex flex-col gap-3">
        <GoogleOAuthProvider clientId="636974945930-hkdlpceh4k6kmrum0mfbclqs35mn9r37.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            render={(renderProps) => (
              <Button
                variant="outlined"
                fullWidth
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  textTransform: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#3C4043',
                  borderColor: '#DADCE0',
                  height: '56px'
                }}
              >
                <svg
                  fill="#DB4437"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                >
                  <path d="M21.35 11.1h-.1V11H12v2.9h5.35c-.55 1.45-2.1 2.8-4.35 2.8-2.6 0-4.71-2.1-4.71-4.7s2.11-4.7 4.71-4.7c.92 0 1.75.35 2.42.91L17.34 3c-.98-.89-2.25-1.4-3.65-1.4-3.87 0-7.01 3.14-7.01 7s3.14 7 7.01 7c3.45 0 6.82-2.89 6.91-7h-.01v-2.1z" />
                </svg>
                <span>Sign in with Google</span>
              </Button>
            )}
          />
        </GoogleOAuthProvider>

        <TwitterLogin
          loginUrl="http://localhost:4000/api/v1/auth/twitter"
          requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"
          showIcon={false}
          credentials="include"
          style={{ display: 'none' }}
          customHeaders={{ "Content-Type": "application/json" }}
          onSuccess={(resp) => {/* handle success */}}
          onFailure={(resp) => {/* handle failure */}}
          tag={() => (
            <Button
              onClick={() => {
                document.querySelector('[data-tag]').click();
              }}
              variant="outlined"
              fullWidth
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                textTransform: 'none',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#3C4043',
                borderColor: '#DADCE0',
                height: '56px'
              }}
            >
              <svg
                fill="#1DA1F2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
              >
                <path d="M23.643 4.937c-.835.37-1.73.622-2.675.734A4.592 4.592 0 0 0 22.6 3.098a9.192 9.192 0 0 1-2.917 1.117 4.473 4.473 0 0 0-7.626 4.07 12.688 12.688 0 0 1-9.23-4.68 4.473 4.473 0 0 0 1.384 5.963c-.798-.025-1.547-.25-2.178-.612v.061a4.473 4.473 0 0 0 3.586 4.379 4.51 4.51 0 0 1-2.03.077 4.473 4.473 0 0 0 4.175 3.102 8.961 8.961 0 0 1-5.567 1.918A13.014 13.014 0 0 0 7.93 21c8.392 0 12.992-7.3 12.992-13.635 0-.208-.004-.42-.013-.631A8.919 8.919 0 0 0 24 4.568a9.03 9.03 0 0 1-2.603.713 4.49 4.49 0 0 0 1.976-2.437z" />
              </svg>
              <span>Sign in with Twitter</span>
            </Button>
          )}
        />
      </div>
    </form>
  );
}

export default JwtSignInForm;