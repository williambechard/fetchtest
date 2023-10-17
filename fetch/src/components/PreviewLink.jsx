import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    linkPreviewCard: {
        display: 'flex',
        width: '100%',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
    },
    previewImage: {
        flex: 1,
        maxWidth: '25%' /* Image takes up a quarter of the width */,
        marginRight: '10px',
        height: '100%',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '5px',
    },
    previewDetails: {
        flex: 3,
        display: 'flex',
        flexDirection: 'column',
    },
    headerRow: {
        padding: '2px',
        fontSize: '16px' /* Adjust the font size as needed */,
        fontWeight: 'bold',
    },
    detailRow: {
        padding: '2px',
        paddingTop: '12px',
        fontSize: '12px',
    },
    sourceRow: {
        color: '#FFC107',
        padding: '2px',
        paddingTop: '0px',
        fontSize: '10px',
    },
    /* Adjust colors, fonts, and other styles as per your project requirements */
}));

const LinkPreview = ({ url }) => {
    const classes = useStyles();
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isYouTubeURL = (URL) => {
        return URL.includes('youtube.com') || URL.includes('youtu.be');
    };
    const extractYouTubeVideoId = (URL) => {
        const videoIdRegex = /(?:\/embed\/|\/watch\?v=|\/(?:embed\/|v\/|watch\?.*v=|youtu\.be\/|embed\/|v=))([^&?#]+)/;
        const match = URL.match(videoIdRegex);
        return match ? match[1] : '';
    };
    // Define a callback function
    function jsonpCallback(data) {
        // Process the JSON data here
        console.log(data);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const data = await response.text();

                const isYouTubeVideo = isYouTubeURL(url);
                if (isYouTubeVideo) {
                    const videoId = extractYouTubeVideoId(url);
                    const videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                    setPreviewData({
                        videoId,
                        videoThumbnail,
                    });
                    setLoading(false);
                } else {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const title = doc.querySelector('title')?.textContent || '';
                    let source = new URL(url).host ?? '';

                    if (source.length > 0) {
                        const [_, secondPart] = source.split('.');
                        source = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
                    }

                    const description =
                        doc
                            .querySelector('meta[name="description"]')
                            ?.getAttribute('content') || '';
                    const image =
                        doc
                            .querySelector('meta[property="og:image"]')
                            ?.getAttribute('content') || '';

                    setPreviewData({
                        title,
                        description,
                        image,
                        source,
                    });
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!previewData) {
        return <p>Failed to fetch link preview.</p>;
    }

    const handleClick = () => {
        window.open(url, '_blank');
    };

    if (previewData.videoId) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleClick}
                style={{ cursor: 'pointer' }}
            >
                <img src={previewData.videoThumbnail} alt="Video Thumbnail" />
            </div>
        );
    }

    return (
        <div
            className={classes.linkPreviewCard}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleClick}
        >
            {previewData.image && (
                <div className={classes.previewImage}>
                    <img
                        src={previewData.image}
                        className={classes.image}
                        alt="Link Preview"
                    />
                </div>
            )}
            <div className={classes.previewDetails}>
                <div className={classes.sourceRow}>{previewData.source}</div>
                <div className={classes.headerRow}>{previewData.title}</div>
                <div className={classes.detailRow}>{previewData.description}</div>
            </div>
        </div>
    );
};

export default LinkPreview;
