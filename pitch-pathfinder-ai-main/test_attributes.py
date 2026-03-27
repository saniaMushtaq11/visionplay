import requests
import json

# Test the /ai/assess endpoint with a video file
def test_attributes():
    # Path to a video file for testing
    video_path = 'runs/exp1/best.pt'  # Using the model file as a test file
    
    # Prepare the file for upload
    files = {'file': open(video_path, 'rb')}
    
    # Send POST request to the endpoint
    response = requests.post('http://127.0.0.1:8002/ai/assess', files=files)
    
    # Print the response status and content
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("\nAttributes:")
        if 'attributes' in result:
            attributes = result['attributes']
            for attr, value in attributes.items():
                if attr != 'filename':
                    print(f"{attr}: {value}")
            
            # Verify the attributes are in the new format
            expected_attrs = ["Shooting", "Dribbling", "Passing", "Defending", "Physicality", "Pace"]
            for attr in expected_attrs:
                if attr in attributes:
                    value = attributes[attr]
                    # Check if value is an integer between 1 and 10
                    if isinstance(value, int) and 1 <= value <= 10:
                        print(f"✓ {attr} has correct format: {value} (integer between 1-10)")
                    else:
                        print(f"✗ {attr} has incorrect format: {value} (should be integer between 1-10)")
                else:
                    print(f"✗ {attr} is missing from the response")
        else:
            print("No attributes found in the response")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_attributes()