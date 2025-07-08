
#!/usr/bin/env python3
"""
Sample Data Import Script for ThreatHunter Pro Splunk App

This script imports the sample data files into a Splunk instance for testing and demonstration purposes.
It uses the Splunk SDK for Python to connect to a Splunk instance and index the provided sample data.

Requirements:
- Python 3.6+
- splunk-sdk

Usage:
    python import_sample_data.py --splunk-host=localhost --splunk-port=8089 [--username=admin] [--password=changeme]
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timedelta

try:
    import splunklib.client as client
    from splunklib.binding import HTTPError
except ImportError:
    print("Error: This script requires the Splunk SDK for Python.")
    print("Install it using: pip install splunk-sdk")
    sys.exit(1)

# Sample data files
SAMPLE_FILES = [
    "security_events.json",
    "network_traffic.json",
    "endpoint_data.json", 
    "compliance_checks.json"
]

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Import sample data into Splunk')
    parser.add_argument('--splunk-host', required=True, help='Splunk host')
    parser.add_argument('--splunk-port', type=int, default=8089, help='Splunk management port')
    parser.add_argument('--username', default='admin', help='Splunk username')
    parser.add_argument('--password', default='changeme', help='Splunk password')
    parser.add_argument('--index', default='main', help='Target Splunk index')
    return parser.parse_args()

def connect_to_splunk(args):
    """Connect to Splunk instance."""
    try:
        service = client.connect(
            host=args.splunk_host,
            port=args.splunk_port,
            username=args.username,
            password=args.password
        )
        return service
    except HTTPError as e:
        print(f"Error connecting to Splunk: {e}")
        sys.exit(1)

def ensure_index_exists(service, index_name):
    """Ensure the specified index exists in Splunk."""
    if index_name not in service.indexes:
        print(f"Index '{index_name}' does not exist. Creating...")
        service.indexes.create(index_name)
    return service.indexes[index_name]

def import_data(service, index_name):
    """Import sample data into Splunk."""
    index = ensure_index_exists(service, index_name)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in SAMPLE_FILES:
        file_path = os.path.join(current_dir, filename)
        if not os.path.exists(file_path):
            print(f"Warning: Sample file {filename} not found.")
            continue
        
        print(f"Importing {filename} into index '{index_name}'...")
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                
            for event in data:
                # Format the event as a string
                event_str = json.dumps(event)
                
                # Submit the event to Splunk
                index.submit(event_str, sourcetype=f"threathunter:{filename.split('.')[0]}")
                
            print(f"Successfully imported {len(data)} events from {filename}")
            
        except Exception as e:
            print(f"Error importing {filename}: {e}")

def main():
    """Main execution function."""
    args = parse_args()
    print(f"Connecting to Splunk at {args.splunk_host}:{args.splunk_port}...")
    
    service = connect_to_splunk(args)
    print(f"Connected successfully to Splunk {service.info['version']}")
    
    import_data(service, args.index)
    print("Sample data import complete!")

if __name__ == "__main__":
    main()
