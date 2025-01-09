import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { devApiLink } from 'app/configs/urlConfig';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
});

function JwtSignInForm() {
  const { control, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();
  const { isValid, dirtyFields, errors } = formState;
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [password, setPassword] = useState('');
  //const password = '12345677';

  function onSubmit(formData) {
	axios.post(`${devApiLink}/user/forgotpassword`, {
		email: formData.email
	  }).then((response) => {
		console.log(response.data.msg);
		if (response.status) {
		  localStorage.setItem('currentUserData', JSON.stringify(response.status));
		   setPassword(response.data.msg);
		  //window.location.href = '/wbt-dashboard';
		}
	  });
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 1000); // Hide tooltip after 1 second
      toast.success('Copied successfully', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    });
  };

  const handleBackToLogin = () => {
    navigate('/sign-in');
  };

  return (
    <div className="flex min-w-0 flex-auto flex-col items-center justify-center">
      <Paper className="flex min-h-full w-full flex-col items-center rounded-0 px-16 py-32 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:p-48 sm:shadow">
        <Typography className="mb-32 text-center text-4xl font-extrabold leading-tight tracking-tight">
          Forgot Password
        </Typography>

        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
          <form
            noValidate
            className="flex w-full flex-col justify-center"
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

            <Button
              variant="contained"
              color="secondary"
              className="mt-16 w-full"
              disabled={Object.keys(dirtyFields).length === 0 || !isValid}
              type="submit"
              size="large"
            >
              Get Your Password
            </Button>

            <Button
              variant="outlined"
              color="primary"
              className="mt-16 w-full"
              onClick={handleBackToLogin}
              size="large"
            >
              Back to Login
            </Button>
          </form>
        </div>
      </Paper>

      {/* Modal Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Typography variant="body1">Your password:</Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" style={{ marginRight: 8 }}>
              {password}
            </Typography>
            <Tooltip
              open={tooltipOpen}
              title="Copied successfully!"
              leaveDelay={300}
            >
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
	
  );
}

export default JwtSignInForm;