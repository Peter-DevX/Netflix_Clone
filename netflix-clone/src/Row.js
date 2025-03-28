// import React, { useEffect, useState } from 'react';
// import axios from './axios';
// import "./Row.css";
// import YouTube from "react-youtube";
// import movieTrailer from 'movie-trailer';

// const base_url = "https://image.tmdb.org/t/p/original/";

// function Row({ title,fetchUrl, isLargeRow }) {
//     const [movies,setMovies] = useState([]);
//     const [trailerUrl, setTrailerUrl] = useState("");

//     useEffect(() => {
//         async function fetcData() {
//             const request = await axios.get(fetchUrl);
//             setMovies(request.data.results);
//             return request;
//         }
//         fetcData();
//     },[fetchUrl]);

//     const opts = {
//         height: '390',
//         width: '100%',
//         playerVars:{
//            autoplay: 1, 
//         },
//     };

    

//     // const handleClick = (movie) => {
//     //     if (trailerUrl){
//     //         setTrailerUrl('');
//     //     } else{
//     //         movieTrailer(movie?.name || '' )
//     //         .then(url => {
//     //             const urlParams = new URLSearchParams(URL(url).search);
//     //             setTrailerUrl(urlParams.get('v'));
//     //         })
//     //         .catch((error)=> console.log(error));
//     //     }
//     // }


//     const handleClick = async (movie) => {
//         // Always reset trailerUrl first
//         setTrailerUrl('');
      
//         // Small delay to ensure reset completes before fetching new trailer
//         await new Promise(resolve => setTimeout(resolve, 100));
      
//         try {
//           const name = movie?.name || movie?.title || movie?.original_name || "";
//           const url = await movieTrailer(name);
      
//           if (url) {
//             const urlParams = new URLSearchParams(new URL(url).search);
//             const videoId = urlParams.get('v');
            
//             if (videoId) {
//               setTrailerUrl(videoId);
//             } else {
//               // Handle shortened YouTube URLs (e.g., youtu.be/VIDEO_ID)
//               const shortUrlId = url.split('/').pop()?.split('?')[0];
//               if (shortUrlId) setTrailerUrl(shortUrlId);
//             }
//           } else {
//             console.log("No trailer found for:", name);
//           }
//         } catch (error) {
//           console.log("Error fetching trailer:", error);
//         }
//       };
    
//   return (
//     <div className='row'>
//     <h2 className='movie__title'>{title}</h2>

//     <div className='row__posters'>
//         {/* several row__poster */}

//         {movies.map(movie => (
//             <img
//             key={movie.id}
//             onClick={() => handleClick(movie)} 
//             className={`row__poster ${isLargeRow && "row__posterLarge"}`}
//             src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`} alt={movie.name} />
//         ))}

//     </div>
//     {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}    
//     </div>
//   )
// }

// export default Row;



import React, { useEffect, useState, useCallback } from 'react';
import axios from './axios';
import "./Row.css";
import YouTube from "react-youtube";
import movieTrailer from 'movie-trailer';

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow }) {
    const [movies, setMovies] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [player, setPlayer] = useState(null); // To control YouTube player

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    }, [fetchUrl]);

    // YouTube player options (autoplay, controls, etc.)
    const opts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0, // Disable related videos at the end
        },
    };

    // Handle when a YouTube player is ready
    const onPlayerReady = (event) => {
        setPlayer(event.target);
    };

    // Handle when the video ends (hide trailer)
    const onPlayerEnd = () => {
        setTrailerUrl("");
        setPlayer(null);
    };

    // Optimized click handler with memoization
    const handleClick = useCallback(async (movie) => {
        if (player) {
            player.stopVideo(); // Stop any currently playing video
            setPlayer(null);
        }
        setTrailerUrl(""); // Reset trailer immediately

        try {
            const name = movie?.name || movie?.title || movie?.original_name || "";
            const url = await movieTrailer(name);

            if (url) {
                const urlParams = new URLSearchParams(new URL(url).search);
                const videoId = urlParams.get('v') || url.split('/').pop()?.split('?')[0];
                if (videoId) setTrailerUrl(videoId);
            }
        } catch (error) {
            console.log("Trailer fetch error:", error);
        }
    }, [player]);

    return (
        <div className='row'>
            <h2 className='movie__title'>{title}</h2>

            <div className='row__posters'>
                {movies.map(movie => (
                    <img
                        key={movie.id}
                        onClick={() => handleClick(movie)}
                        className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                        src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                        alt={movie.name}
                        loading="lazy" // Optimize image loading
                    />
                ))}
            </div>

            {trailerUrl && (
                <YouTube
                    videoId={trailerUrl}
                    opts={opts}
                    onReady={onPlayerReady}
                    onEnd={onPlayerEnd}
                />
            )}
        </div>
    );
}

export default Row;