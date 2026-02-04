
import unittest
import sys
import os

# Add backend to path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# We need to mock module imports that might be missing or heavy
from unittest.mock import MagicMock
sys.modules['librosa'] = MagicMock()
sys.modules['torch'] = MagicMock()
sys.modules['btc_model'] = MagicMock()
sys.modules['utils.hparams'] = MagicMock()

# Now we can import the specific functions we want to test
# We might need to handle imports carefully if they are top-level
try:
    from services.chord_detector import format_chord_for_guitar, detect_key, IDX2CHORD
except ImportError:
    # If direct import fails (e.g. issues with relative imports inside the module), 
    # we might need to be more creative or load source directly.
    # For now let's hope the sys.path hack works.
    import importlib.util
    spec = importlib.util.spec_from_file_location("chord_detector", 
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/services/chord_detector.py')))
    chord_detector = importlib.util.module_from_spec(spec)
    sys.modules["services.chord_detector"] = chord_detector
    spec.loader.exec_module(chord_detector)
    format_chord_for_guitar = chord_detector.format_chord_for_guitar
    detect_key = chord_detector.detect_key
    
class TestChordFormatting(unittest.TestCase):
    
    def test_e_major_context(self):
        """Test that in E Major, G# is preserved and not converted to Ab."""
        # E Major chords: E, F#m, G#m, A, B, C#m, D#dim
        # Current logic converts G#m -> Abm, D# -> Eb
        
        # Simulating what we want the new logic to do.
        # Currently the function just takes a string. 
        # We will eventually verify the Orchestration, but first let's verify existing failure.
        
        # Test 1: Verify Orchestration logic
        
        # 1. Detect key (simulated raw chords from E Major)
        # E Major keys: E, F#m, G#m, A, B, C#m
        raw_chords_input = [{'chord': 'E'}, {'chord': 'A'}, {'chord': 'B'}, {'chord': 'G#:min'}]
        detected_key = detect_key(raw_chords_input)
        self.assertEqual(detected_key, 'E')
        
        # 2. Check context
        try:
            from services.chord_detector import should_use_sharps
        except ImportError:
             # Fallback if imported via module spec
            should_use_sharps = sys.modules["services.chord_detector"].should_use_sharps

        use_sharps = should_use_sharps(detected_key)
        self.assertTrue(use_sharps, "Key E should use sharps")
        
        # 3. Format chord with context
        formatted = format_chord_for_guitar("G#:min", use_sharps=use_sharps)
        
        print(f"DEBUG: Formatted G#:min (in E context) -> {formatted}")
        self.assertEqual(formatted, "G#m", "Should preserve G#m in Sharp context")
        
        # Test Flats context too
        # F Major: F, Gm, Am, Bb, C, Dm
        flat_key = 'F'
        use_sharps_flat = should_use_sharps(flat_key)
        self.assertFalse(use_sharps_flat, "Key F should NOT use sharps")
        
        # F Major has Bb. Raw might be A# (from model).
        formatted_flat = format_chord_for_guitar("A#", use_sharps=use_sharps_flat)
        self.assertEqual(formatted_flat, "Bb", "Should convert A# to Bb in Flat context")
        
    def test_detect_key_logic(self):
        """Test basic key detection logic (preprocessing)."""
        # Current detect_key expects list of objects with 'chord' key
        chords = [
            {'chord': 'E'}, 
            {'chord': 'A'}, 
            {'chord': 'B'}, 
            {'chord': 'E'},
            {'chord': 'G#m'} # Note: raw prediction might be 'G#:min'
        ]
        # We need raw chords effectively
        key = detect_key(chords)
        self.assertEqual(key, 'E')

if __name__ == '__main__':
    unittest.main()
