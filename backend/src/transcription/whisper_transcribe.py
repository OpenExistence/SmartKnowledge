"""Transcription using Whisper."""
import os
import json
from pathlib import Path

# Note: This requires whisper to be installed
# pip install openai-whisper

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: whisper not installed. Run: pip install openai-whisper")


def transcribe_audio(audio_path: str, model_size: str = "base") -> dict:
    """
    Transcribe an audio file using Whisper.
    
    Args:
        audio_path: Path to the audio file
        model_size: Whisper model size (tiny, base, small, medium, large)
    
    Returns:
        dict with 'text', 'segments', and optional 'language'
    """
    if not WHISPER_AVAILABLE:
        return {
            "error": "Whisper not installed. Run: pip install openai-whisper"
        }
    
    if not os.path.exists(audio_path):
        return {"error": f"Audio file not found: {audio_path}"}
    
    print(f"Loading Whisper model: {model_size}")
    model = whisper.load_model(model_size)
    
    print(f"Transcribing: {audio_path}")
    result = model.transcribe(audio_path, language="fr")
    
    return {
        "text": result["text"],
        "segments": result.get("segments", []),
        "language": result.get("language", "fr"),
        "duration": result.get("duration", 0)
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


def transcribe_and_save(audio_path: str, output_dir: str, model_size: str = "base") -> dict:
    """
    Transcribe audio and save to output directory.
    
    Args:
        audio_path: Source audio file
        output_dir: Directory to save transcription
        model_size: Whisper model size
    
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
        print("Usage: python whisper_transcribe.py <audio_file> [output_dir]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "transcriptions"
    
    result = transcribe_and_save(audio_file, output_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2))
