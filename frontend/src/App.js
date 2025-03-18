import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Slider,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Stack,
    Switch,
    FormControlLabel,
    TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

// API endpoint
const API_URL = process.env.REACT_APP_API_URL || '/api/try-on/upload';

// Styled components
const DropzoneContainer = styled(Box)(({ theme, isDragActive, isUploaded }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : isUploaded ? theme.palette.success.main : theme.palette.grey[400]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
    transition: 'all 0.3s ease',
    height: 300,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
}));

const PreviewImage = styled('img')({
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    position: 'absolute',
});

const ResultImage = styled('img')({
    width: '100%',
    height: 'auto',
    maxHeight: 600,
    objectFit: 'contain',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: 8,
});

function ImageDropzone({ onDrop, title, preview }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        onDrop
    });

    return ( <
        DropzoneContainer {...getRootProps() }
        isDragActive = { isDragActive }
        isUploaded = {!!preview } >
        <
        input {...getInputProps() }
        /> {
            preview ? ( <
                PreviewImage src = { preview }
                alt = { title }
                />
            ) : ( <
                >
                <
                Typography variant = "h6"
                gutterBottom > { title } < /Typography> <
                Typography variant = "body2"
                color = "textSecondary" >
                Drag & drop an image here, or click to select <
                /Typography> <
                />
            )
        } <
        /DropzoneContainer>
    );
}

function App() {
    // State
    const [humanImage, setHumanImage] = useState(null);
    const [humanPreview, setHumanPreview] = useState('');
    const [garmentImage, setGarmentImage] = useState(null);
    const [garmentPreview, setGarmentPreview] = useState('');
    const [resultImage, setResultImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingTime, setProcessingTime] = useState(0);

    // Parameters
    const [guidanceScale, setGuidanceScale] = useState(2.5);
    const [inferenceSteps, setInferenceSteps] = useState(30);
    const [seed, setSeed] = useState(42);
    const [refAcceleration, setRefAcceleration] = useState(false);

    // Handle human image drop
    const handleHumanDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setHumanImage(file);
            setHumanPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle garment image drop
    const handleGarmentDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setGarmentImage(file);
            setGarmentPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle form submission
    const handleSubmit = async() => {
        if (!humanImage || !garmentImage) {
            setError('Please upload both a human image and a garment image');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setResultImage('');

        try {
            const formData = new FormData();
            formData.append('human_image', humanImage);
            formData.append('garment_image', garmentImage);
            formData.append('guidance_scale', guidanceScale);
            formData.append('num_inference_steps', inferenceSteps);
            formData.append('seed', seed);
            formData.append('ref_acceleration', refAcceleration);

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResultImage(response.data.result_image);
            setProcessingTime(response.data.processing_time);
            setSuccess(`Processing completed in ${response.data.processing_time.toFixed(2)} seconds`);
        } catch (err) {
            console.error(err);
            setError(err.response ? .data ? .detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        setHumanImage(null);
        setHumanPreview('');
        setGarmentImage(null);
        setGarmentPreview('');
        setResultImage('');
        setError('');
        setSuccess('');
        setGuidanceScale(2.5);
        setInferenceSteps(30);
        setSeed(42);
        setRefAcceleration(false);
    };

    // Generate a random seed
    const handleRandomSeed = () => {
        setSeed(Math.floor(Math.random() * 1000000));
    };

    return ( <
            Container maxWidth = "lg"
            sx = {
                { py: 4 } } >
            <
            Typography variant = "h3"
            component = "h1"
            align = "center"
            gutterBottom >
            Leffa Virtual Try - On <
            /Typography> <
            Typography variant = "body1"
            align = "center"
            sx = {
                { mb: 4 } } >
            Upload a person image and a garment image to see how the garment would look on the person. <
            /Typography>

            {
                error && < Alert severity = "error"
                sx = {
                    { mb: 2 } } > { error } < /Alert>} {
                    success && < Alert severity = "success"
                    sx = {
                        { mb: 2 } } > { success } < /Alert>}

                    <
                    Grid container spacing = { 3 } >
                        <
                        Grid item xs = { 12 }
                    md = { 8 } >
                        <
                        Card >
                        <
                        CardContent >
                        <
                        Grid container spacing = { 2 } >
                        <
                        Grid item xs = { 12 }
                    sm = { 6 } >
                        <
                        Typography variant = "h6"
                    gutterBottom > Person Image < /Typography> <
                        ImageDropzone
                    onDrop = { handleHumanDrop }
                    title = "Person Image"
                    preview = { humanPreview }
                    /> <
                    /Grid> <
                    Grid item xs = { 12 }
                    sm = { 6 } >
                        <
                        Typography variant = "h6"
                    gutterBottom > Garment Image < /Typography> <
                        ImageDropzone
                    onDrop = { handleGarmentDrop }
                    title = "Garment Image"
                    preview = { garmentPreview }
                    /> <
                    /Grid> <
                    /Grid> <
                    /CardContent> <
                    /Card> <
                    /Grid>

                    <
                    Grid item xs = { 12 }
                    md = { 4 } >
                        <
                        Card >
                        <
                        CardContent >
                        <
                        Typography variant = "h6"
                    gutterBottom > Parameters < /Typography>

                    <
                    Box sx = {
                            { mb: 2 } } >
                        <
                        Typography gutterBottom > Guidance Scale: { guidanceScale } < /Typography> <
                        Slider
                    value = { guidanceScale }
                    onChange = {
                        (_, value) => setGuidanceScale(value) }
                    min = { 0.1 }
                    max = { 5.0 }
                    step = { 0.1 }
                    valueLabelDisplay = "auto"
                    disabled = { loading }
                    /> <
                    /Box>

                    <
                    Box sx = {
                            { mb: 2 } } >
                        <
                        Typography gutterBottom > Inference Steps: { inferenceSteps } < /Typography> <
                        Slider
                    value = { inferenceSteps }
                    onChange = {
                        (_, value) => setInferenceSteps(value) }
                    min = { 10 }
                    max = { 50 }
                    step = { 1 }
                    valueLabelDisplay = "auto"
                    disabled = { loading }
                    /> <
                    /Box>

                    <
                    Box sx = {
                            { mb: 2 } } >
                        <
                        Stack direction = "row"
                    spacing = { 2 }
                    alignItems = "center" >
                        <
                        TextField
                    label = "Seed"
                    value = { seed }
                    onChange = {
                        (e) => setSeed(parseInt(e.target.value) || 0) }
                    type = "number"
                    variant = "outlined"
                    size = "small"
                    disabled = { loading }
                    fullWidth
                        /
                        >
                        <
                        Button
                    variant = "outlined"
                    onClick = { handleRandomSeed }
                    disabled = { loading } >
                        Random <
                        /Button> <
                        /Stack> <
                        /Box>

                    <
                    Box sx = {
                            { mb: 3 } } >
                        <
                        FormControlLabel
                    control = { <
                        Switch
                        checked = { refAcceleration }
                        onChange = {
                            (e) => setRefAcceleration(e.target.checked) }
                        disabled = { loading }
                        />
                    }
                    label = "Reference Acceleration" /
                        >
                        <
                        /Box>

                    <
                    Stack direction = "row"
                    spacing = { 2 } >
                        <
                        Button
                    variant = "contained"
                    color = "primary"
                    onClick = { handleSubmit }
                    disabled = { loading || !humanImage || !garmentImage }
                    fullWidth
                        >
                        { loading ? < CircularProgress size = { 24 }
                            color = "inherit" / > : 'Generate' } <
                        /Button> <
                        Button
                    variant = "outlined"
                    onClick = { handleReset }
                    disabled = { loading } >
                        Reset <
                        /Button> <
                        /Stack> <
                        /CardContent> <
                        /Card> <
                        /Grid>

                    { /* Result Section */ } {
                        resultImage && ( <
                            Grid item xs = { 12 } >
                            <
                            Card >
                            <
                            CardContent >
                            <
                            Typography variant = "h6"
                            gutterBottom align = "center" >
                            Result(Processing Time: { processingTime.toFixed(2) }
                                s) <
                            /Typography> <
                            Box sx = {
                                { display: 'flex', justifyContent: 'center', mt: 2 } } >
                            <
                            ResultImage src = { resultImage }
                            alt = "Result" / >
                            <
                            /Box> <
                            Box sx = {
                                { display: 'flex', justifyContent: 'center', mt: 2 } } >
                            <
                            Button variant = "contained"
                            color = "primary"
                            href = { resultImage }
                            download = "leffa-tryon-result.jpg" >
                            Download <
                            /Button> <
                            /Box> <
                            /CardContent> <
                            /Card> <
                            /Grid>
                        )
                    } <
                    /Grid> <
                    /Container>
                );
            }

            export default App;