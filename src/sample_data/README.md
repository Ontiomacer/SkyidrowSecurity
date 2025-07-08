
# Sample Data for ThreatHunter Pro

This directory contains sample data files that can be used to test and demonstrate the functionality of the ThreatHunter Pro Splunk App.

## Available Sample Datasets

1. **security_events.json** - Sample security events including authentication attempts, firewall logs, and IDS/IPS alerts
2. **network_traffic.json** - Sample network traffic data including connection logs and protocol information
3. **endpoint_data.json** - Sample endpoint data including process execution and registry modifications
4. **compliance_checks.json** - Sample compliance check results for PCI DSS, HIPAA, and other frameworks

## Usage Instructions

To import the sample data into your Splunk instance:

1. Use the provided import script:
   ```bash
   python import_sample_data.py --splunk-host=localhost --splunk-port=8089
   ```
   
2. Alternatively, manually upload the data using Splunk Web:
   - Navigate to Settings > Add Data
   - Select "Upload files from my computer"
   - Choose files from this directory
   - Follow the guided data import workflow

## Data Schema

Each sample dataset follows a specific schema designed to work with the app's dashboards and searches:

### Security Events
- timestamp
- event_type
- source_ip
- destination_ip
- username
- action
- status
- severity

### Network Traffic
- timestamp
- source_ip
- destination_ip
- source_port
- destination_port
- protocol
- bytes_in
- bytes_out
- connection_state

### Endpoint Data
- timestamp
- hostname
- username
- process_name
- process_id
- parent_process_id
- command_line
- md5_hash
- file_path

### Compliance Checks
- timestamp
- hostname
- check_id
- framework
- requirement
- status
- description
- remediation

## Notes

- All IP addresses and hostnames in the sample data are fictional
- User data has been anonymized
- Sample timestamps span a 7-day period
- Data volume is optimized for demonstration purposes

For questions about the sample data, please refer to the main documentation or contact support@threathunterpro.com.
