import requests
import os
from bs4 import BeautifulSoup
import datetime
import re
from openai import OpenAI
client = OpenAI()

def get_todays_date():
    now = datetime.datetime.now()
    timestamp = now.strftime("%d-%m") # _%H-%M-%S
    return timestamp

PATH_HTML = '_layouts/essen.html'

german_weekdays_offsets ={
    'Montag': 0,
    'Dienstag': 1,
    'Mittwoch': 2,
    'Donnerstag': 3,
    'Freitag': 4,
    'Samstag': 5,
    'Sonntag': 6,
}

german_month_names = {
    'Januar': 1,
    'Februar': 2,
    'März': 3,
    'April': 4,
    'Mai': 5,
    'Juni': 6,
    'Juli': 7,
    'August': 8,
    'September': 9,
    'Oktober': 10,
    'November': 11,
    'Dezember': 12,
    'Jan': 1,
    'Feb': 2,
    'Mär': 3,
    'Mar': 3,
    'Apr': 4,
    'Mai': 5,
    'Jun': 6,
    'Jul': 7,
    'Aug': 8,
    'Sep': 9,
    'Okt': 10,
    'Nov': 11,
    'Dez': 12
}

def get_todays_year():
    # Get today's date
    today = datetime.datetime.now()
    return today.year

def get_todays_weekday():

    # Get today's date
    today = datetime.datetime.now()

    # Get the weekday index (0 = Monday, 6 = Sunday)
    weekday_index = today.weekday()

    # List of weekday names
    weekday_names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

    # Get the weekday name
    weekday_name = weekday_names[weekday_index]
    return weekday_name

todays_weekday = get_todays_weekday()
todays_date = datetime.datetime.now().strftime('%Y-%m-%d')
dict_mensa_essen = {}
dict_mensa_date = {}


url = 'https://www.swfr.de/essen/mensen-cafes-speiseplaene/freiburg/mensa-flugplatz'
response = requests.get(url)
html_content = response.content

soup = BeautifulSoup(html_content, 'html.parser')

menu_elements = soup.select('.menu-tagesplan')

swfr_flugplatz_essen = []
swfr_flugplatz_date = []
for element in menu_elements:
    essen_weekday = element.find('h3').get_text()
    if todays_weekday not in essen_weekday:
        continue
    extra_text_elements = element.select('small.extra-text')

    for element_essen in extra_text_elements:
        try:
            essen = element_essen.get_text(separator=', ')
            swfr_flugplatz_essen.append(essen)
            date = essen_weekday.split(' ')[-1]
            swfr_flugplatz_date.append(date)
        except Exception as e:
            pass

if len(swfr_flugplatz_essen) > 0:
    dict_mensa_essen['SWFR Flugplatz'] = swfr_flugplatz_essen
    dict_mensa_date['SWFR Flugplatz'] = swfr_flugplatz_date
else:
    dict_mensa_essen['SWFR Flugplatz'] = ['Empty plate.']
    dict_mensa_date['SWFR Flugplatz'] = [get_todays_date()]

url = 'https://www.ipm.fraunhofer.de/de/ueber-fraunhofer-ipm/fraunhofer-ipm-kantine.html'
response = requests.get(url)
html_content = response.content
 
soup = BeautifulSoup(html_content, 'html.parser')
tab_par_element = soup.select('.tabPar')[0] #.first()
rows = tab_par_element.find_all('tr')
# example "27. Nov. – 1. Dez."
# remove spaces at the end of the string
monday_date_number, monday_date_month, _, friday_date_number, friday_date_month = tab_par_element.find_all('h4')[0].get_text().strip().replace('.', '').split(' ')

monday_date_number = int(monday_date_number)
friday_date_number = int(friday_date_number)
monday_date_month = german_month_names[monday_date_month]
friday_date_number = german_month_names[friday_date_month]

fraunhofer_ipm_essen = []
fraunhofer_ipm_date = []
for row in rows:
    essens_infos = row.find_all('td')

    try:
        weekday = essens_infos[0].get_text()
        if todays_weekday not in weekday:
            continue

        for essen_info in essens_infos[1].find_all('li'):
            date = datetime.datetime(year=int(get_todays_year()), month=monday_date_month, day=int(monday_date_number)) + datetime.timedelta(days=german_weekdays_offsets[weekday.split(' ')[0]])
            date = date.strftime("%d.%m.")
            fraunhofer_ipm_date.append(date)
            essen = essen_info.get_text().replace('\xa0', '')
            essen = re.sub(r'\[.*?\]', '', essen)
            fraunhofer_ipm_essen.append(essen)
    except Exception as e:
        pass

if len(fraunhofer_ipm_essen) > 0:
    dict_mensa_essen['Fraunhofer IPM'] = fraunhofer_ipm_essen
    dict_mensa_date['Fraunhofer IPM'] = fraunhofer_ipm_date
else:
    dict_mensa_essen['Fraunhofer IPM'] = ['Empty plate.']
    dict_mensa_date['Fraunhofer IPM'] = [get_todays_date()]

html_text = """
<!DOCTYPE html>
<html>
<head>
    <title>Today's Mensa Options</title>
    <style>
        /* Apply CSS to style the <li> elements */
        
        ul.grid-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 0.5fr));
            gap: 10px;
            text-align: center;
            width: 100%;
        }

        ul.grid-list li {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            width: 0.25fr;
        }
        .fancy-title {
            
            font-size: 36px;
            color: black;
            text-align: center;
            margin-top: 50px;
        }
    </style>
</head>
<body>


<div>
"""
for mensa in dict_mensa_essen.keys():
    html_text += f"""
        <h2 class="fancy-title">{mensa}</h2>
        <ul  class="grid-list">
        """
    for i, essen in enumerate(dict_mensa_essen[mensa]):
        date = dict_mensa_date[mensa][i]
        html_text += f"""
        <li>
            {essen} ({date}) <br>
            <img width="45%" src="assets/img/artur.jpeg" alt="Local Image">
            <!-- <img width="45%" src="assets/img/mensa_{todays_date}_{mensa}_{i}.jpg" alt="Local Image"> -->
            <br>
        </li>
        """
    html_text += f"""
            </ul>
            """
html_text += f"""
    </div>
    
    <div>
  <iframe
    title="Weather Radar Map"
    src="https://embed.windy.com/embed2.html?lat=48.000&lon=7.850&zoom=12&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
    width="100%"
    height="450px"
  ></iframe>
</div>
    </body>
</html>
        """

# Convert special characters to HTML entities
html_encoded = html_text.replace("ä", "&auml;").replace("ö", "&ouml;").replace("ü", "&uuml;").replace("ß", "&szlig;").replace("»", "&raquo;").replace("«", "&laquo;")

# Open the file in write mode and write the HTML content
with open(PATH_HTML, 'w') as file:
    file.write(html_encoded)

# for mensa in dict_mensa_essen.keys():
#     for i, essen in enumerate(dict_mensa_essen[mensa]):
#         response = client.images.generate(
#             model="dall-e-2",
#             prompt=f"A plate containing the following ingredients written in german: {essen}",
#             size="1024x1024",
#             quality="standard",
#             n=1,
#         )
#         image_url = response.data[0].url

#         # download the image and save it to the current directory
#         img_data = requests.get(image_url).content
#         with open(f'assets/img/mensa_{todays_date}_{mensa}_{i}.jpg', 'wb') as handler:
#             handler.write(img_data)

