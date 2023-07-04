const axios = require("axios");

// Your API token is already set in this variable
const API_TOKEN = "51ebd6bd1c9a46fbaaaa1e3fc595d735";

// Function to upload a file to the AssemblyAI API
async function uploadFile(apiToken, file) {
    const url = "https://api.assemblyai.com/v2/upload";

    try {
        // Send a POST request to the API to upload the file, passing in the headers and the file data
        const response = await axios.post(url, file.data, {
            headers: {
                "Content-Type": "application/octet-stream",
                Authorization: apiToken,
            },
        });

        // If the response is successful, return the upload URL
        if (response.status === 200) {
            const responseData = response.data;
            return responseData["upload_url"];
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        return null;
    }
}

// Async function that sends a request to the AssemblyAI transcription API and retrieves the transcript
async function transcribeAudio(apiToken, audioUrl) {

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: apiToken,
        "content-type": "application/json",
    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: audioUrl },
        { headers }
    );

    // Retrieve the ID of the transcript from the response data
    const responseData = response.data;
    const transcriptId = responseData.id;

    // Construct the polling endpoint URL using the transcript ID
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

    // Poll the transcription API until the transcript is ready
    while (true) {
        // Send a GET request to the polling endpoint to retrieve the status of the transcript
        const pollingResponse = await axios.get(pollingEndpoint, { headers });
        const transcriptionResult = pollingResponse.data;

        // If the transcription is complete, return the transcript object
        if (transcriptionResult.status === "completed") {
            return transcriptionResult;
        }
        // If the transcription has failed, throw an error with the error message
        else if (transcriptionResult.status === "error") {
            throw new Error(
                `Transcription failed: ${transcriptionResult.error}`
            );
        }
        // If the transcription is still in progress, wait for a few seconds before polling again
        else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

module.exports.convertToText = async (req, res) => {
    if(req.files && req.files.audioFile) {
        const file = req.files.audioFile;

        const uploadUrl = await uploadFile(API_TOKEN, file);
        // If the upload fails, log an error and return
        if (!uploadUrl) {
            console.error(new Error("Upload failed. Please try again."));
            return;
        }
    
        // Transcribe the audio file using the upload URL
        const transcript = await transcribeAudio(API_TOKEN, uploadUrl);
    
        // Print the completed transcript object
        return res.status(200).json({
            transcript: transcript.text
        })

    }

    return res.status(200).json({
        message: "Bo"
    })
};
