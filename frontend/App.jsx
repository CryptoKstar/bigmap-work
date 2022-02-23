import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {Box, Button, CircularProgress, Grid, Input, Stack, Typography} from  '@mui/material'

import { Actor } from '@dfinity/agent';

import { useUploadFile } from './src/File';
import { httpAgent, httpAgentIdentity } from './src/httpAgent';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

const App  =  () => {

  const [progress, setProgress] = useState(0);
  const [File , setFile] =useState([])

  const handUpload = async () => {
    console.log(File)
    const icdrive = await httpAgent();
    const canisterData = await icdrive.createCanister()
    const data = canisterData[0];
    console.log(data.canister_data[0].toText())
    console.log(data.canister_data[1].toText())
    localStorage.setItem('fileCanister', data.canister_data[0].toText());
    localStorage.setItem('UserName', data.canister_data[1].toText());
    // const timer = setInterval(() => {
    //   setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    // }, 800);
    // return () => {
    //   clearInterval(timer);
    // };
  }

  return(
    <Box>
      <Grid container p={10}>
        <Grid item md={6} alignItems="center" justifyContent="center">
          <Typography variant='h3'>Upload Video</Typography>
          <Stack direction="row" pt={10} spacing={5}>
            <Stack direction="row" spacing={3}>
              <Input accept="*" id="contained-button-file" multiple type="file" onChange={(e) => setFile(e.target.files)} />
              <Button variant="contained" component="span" onClick={() => handUpload()}>
                Upload
              </Button>
            </Stack>
            <CircularProgressWithLabel value={progress} />
          </Stack>
        </Grid>

        <Grid item md={6}>

        </Grid>

      </Grid>
        
    </Box>
  )
}
export default App