"""Transcription using Faster Whisper."""
import os
import json
from pathlib import Path

try:
    from faster_whisper import WhisperModel
    FASTER_WHISPER_AVAILABLE = True
except ImportError:
    FASTER_WHISPER_AVAILABLE = False
    print("Warning: faster-whisper not installed. Run: pip install faster-whisper")


# Model sizes: tiny, base, small, medium, large-v2, large-v3
DEFAULT_MODEL = "small"  # ~900MB


def transcribe_audio(audio_path: str, model_size: str = DEFAULT_MODEL) -> dict:
    """
    Transcribe an audio file using Faster Whisper.
    
    Args:
        audio_path: Path to the audio file
        model_size: Faster Whisper model size (tiny, base, small, medium, large-v2)
    
    Returns:
        dict with 'text', 'segments', and optional 'language'
    """
    if not FASTER_WHISPER_AVAILABLE:
        return {
            "error": "faster-whisper not installed. Run: pip install faster-whisper"
        }
    
    if not os.path.exists(audio_path):
        return {"error": f"Audio file not found: {audio_path}"}
    
    print(f"Loading Faster Whisper model: {model_size}")
    # Use CPU with int8 for faster processing and lower memory
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    print(f"Transcribing: {audio_path}")
    # Get file size for logging
    file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
    print(f"Audio file size: {file_size_mb:.2f} MB")
    
    segments, info = model.transcribe(
        audio_path,
        language="fr",
        beam_size=5,
        vad_filter=True,  # Voice Activity Detection
        # Better settings for long audio
        word_timestamps=False,  # Reduce memory for long files
        condition_on_previous_text=True,
        initial_prompt="Transcription d'entretien expert.",  # Help with context
    )
    
    # Collect all segments
    all_text = []
    all_segments = []
    
    for segment in segments:
        all_text.append(segment.text)
        all_segments.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        })
    
    full_text = " ".join(all_text)
    
    return {
        "text": full_text,
        "segments": all_segments,
        "language": info.language if info.language else "fr",
        "duration": info.duration if info.duration else 0
    }


def save_transcription(transcription: dict, output_path: str):
    """Save transcription to a text file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(transcription["text"])
    
    # Also save JSON with metadata
    json_path = output_path.replace(".txt", ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=2)
    
    return output_path


def transcribe_and_save(audio_path: str, output_dir: str, model_size: str = DEFAULT_MODEL) -> dict:
    """
    Transcribe audio and save to output directory.
    
    Args:
        audio_path: Source audio file
        output_dir: Directory to save transcription
        model_size: Faster Whisper model size
    
    Returns:
        dict with paths and transcription text
    """
    result = transcribe_audio(audio_path, model_size)
    
    if "error" in result:
        return result
    
    # Generate output filename
    audio_name = Path(audio_path).stem
    output_path = os.path.join(output_dir, f"{audio_name}.txt")
    
    save_transcription(result, output_path)
    
    return {
        "text": result["text"],
        "output_path": output_path,
        "json_path": output_path.replace(".txt", ".json"),
        "duration": result.get("duration", 0)
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python whisper_transcribe.py <audio_file> [output_dir] [model]")
        print("Models: tiny, base, small, medium, large-v2, large-v3")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "transcriptions"
    model_size = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_MODEL
    
    result = transcribe_and_save(audio_file, output_dir, model_size)
    print(json.dumps(result, ensure_ascii=False, indent=2))
