---
title: A program to convert Apple Health exports into compressed markdown files.
date: 2026-08-09
excerpt: Takes raw Apple Health dump and converts into compact markdown.
tags:
  - health
  - tools
---
Simply put, It takes your raw Apple Health dump (`export.xml` and GPX route files) and converts them into compact markdown files. 

To export from the Health app, 
go to the Health app
tap on the profile
scroll to the very bottom
tap "Export All Health Data"

In `parse_apple_health_xml`, it streams `export.xml` using `iterparse` and clears processed tags from RAM. As it parses, it categorizes raw records into steps, workouts, body weight, heart rate, nutrition, and sleep.

Once parsed, it generates 7 specific files:
* **Steps** `write_steps_md`: Puts step totals into 24 hourly buckets (`h0` through `h23`) for every day.
* **Heart Rate** write_heart_rate_md: Outputting timestamped BPM readings.
* **Sleep** `write_sleep_md`: Combines sleep segments into sessions if gaps are under 3 hours, and uses binary search (`bisect`) to attach heart rate readings recorded during that exact sleep window.
* **Workouts** `write_workouts_md`: Pulls workout metrics. Calculates min, max, and average HR by looking up the heart rate records if missing.
* **Nutrition** `write_nutrition_md` & **Body Mass** `write_body_md`: Formats meal metrics and body weight entries chronologically.
* **GPS Routes** `write_gps_data_md`: Reads `.gpx` files in `workout-routes/` and records time, coordinates, elevation, and speed. Thins track points down to 1 per minute

### Execution

Get it from [tsavid/health](https://github.com/tsavid/health) and try yourself

````Terminal
python export_md.py
````

When run, it;
	checks for dependencies,
	creates the output directory,
	runs all exporters,
	and outputs "Complete".

### Feedback

[File an issue / Request a new feature](https://github.com/tsavid/health/issues)

[Share your thoughts on this, feedback@tinusha.com](mailto:feedback@tinusha.com?subject=Feedback%20on%20export_md)

[contact me, hello@tinusha.com](mailto:hello@tinusha.com)
