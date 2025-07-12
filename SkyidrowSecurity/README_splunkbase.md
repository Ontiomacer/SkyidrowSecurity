# Skyidrow Security Intelligence Splunk App

This folder contains the Splunkbase-ready version of the Skyidrow Security Intelligence Platform.

## Structure

- `default/app.conf`: Splunk app manifest (required)
- `appserver/static/`: Place your frontend build output here (see below)
- `README.md`: Main documentation

## How to Build and Deploy for Splunkbase

1. **Build the Frontend**
   ```sh
   npm run build
   ```
   This will output static files to `dist/` (or similar).

2. **Copy Build Output**
   Copy the contents of your `dist/` folder into `SkyidrowSecurity/appserver/static/`.

3. **Package the App**
   From the parent directory:
   ```sh
   tar -czvf SkyidrowSecurity-1.0.0.tar.gz SkyidrowSecurity/
   ```

4. **Install in Splunk**
   - Go to Splunk Web > Manage Apps > Install app from file
   - Upload the `SkyidrowSecurity-1.0.0.tar.gz` file

5. **Access the App**
   - The app will appear in your Splunk navigation.
   - Open it to access the Skyidrow Security Intelligence UI.

## Integration Notes
- You can add Splunk dashboards, custom search commands, or REST API integrations as needed.
- For advanced integration, see Splunk developer docs: https://dev.splunk.com/enterprise/docs/developapps/

---

For support, see the main README or contact the maintainers.
