# import os
# import pandas as pd
# import google.generativeai as genai
# import sqlalchemy
# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy import text
# from rapidfuzz import process
# import json
# import random
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.linear_model import LogisticRegression
# from flask import Flask, flash, request, jsonify, render_template, session
# import datetime
# import csv
# # Add to imports
# from werkzeug.utils import secure_filename
# import tempfile

# import speech_recognition as sr


# app = Flask(__name__)
# app.secret_key = "your_secret_key"  # Replace with your actual secret key
# DATABASE_URL = "mysql+pymysql://root@localhost:3306/collegedata"  # Replace with your actual details

# # Load Gemini API Key securely
# os.environ["GEMINI_API_KEY"] = "AIzaSyAy0IUrqWfBs6ITZvjU3F8Hq31l-EPqD6o"  # Replace with your actual API key
# app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# db = SQLAlchemy(app)


# def configure_gemini_api():
#     try:
#         genai.configure(api_key=os.environ["GEMINI_API_KEY"])
#         return genai.GenerativeModel(
#             model_name="gemini-1.5-flash",
#             generation_config={
#                 "temperature": 0.7,
#                 "top_p": 0.95,
#                 "top_k": 40,
#                 "max_output_tokens": 1000,
#                 "response_mime_type": "text/plain",
#             },
#         )
#     except Exception as e:
#         return None

# chat_model = configure_gemini_api()

# # Database configuration

# def fetch_data_from_db(query, params=None):
#     """Fetch data from the database."""
#     try:
#         engine = sqlalchemy.create_engine(DATABASE_URL)
#         with engine.connect() as connection:
#             if params:
#                 return pd.read_sql(query, connection, params=params)
#             return pd.read_sql(query, connection)
#     except Exception as e:
#         return f"Error fetching data from database: {str(e)}"

# # Define a mapping of keywords to tables
# table_mapping = {
#     "placement": "sanjivaniplacementinfo",
#     "admission": "admission_requirements",
#     "department": "department_details",
#     "cutoff": "admission_requirements",
#     "score":"admission_requirements",
#     "faculty": "department_details",
#     "professor": "department_details",
#     "fees": "admission_requirements",
#     "intake":"admission_requirements",
# }

# # Function to interact with Gemini API
# def ask_gemini(prompt):
#     try:
#         chat_session = chat_model.start_chat(history=[])
#         response = chat_session.send_message(prompt)
#         return response.text.strip()
#     except Exception as e:
#         return f"Error with Gemini API: {str(e)}"



# # Function to find the closest match for keywords
# def find_closest_match(query, options, threshold=50):
#     if not query or not options:
#         return None

#     closest_match = process.extractOne(query, options)
#     if closest_match:
#         match, score = closest_match[:2]
#         return match if score >= threshold else None
#     return None

# # Load intents and preprocess for fallback
# file_path = os.path.abspath("./intents.json")
# with open(file_path, "r") as file:
#     intents = json.load(file)

# vectorizer = TfidfVectorizer()
# clf = LogisticRegression(random_state=0, max_iter=10000)

# patterns, tags = [], []
# for intent in intents:
#     for pattern in intent['patterns']:
#         patterns.append(pattern)
#         tags.append(intent['tag'])

# x = vectorizer.fit_transform(patterns)
# y = tags
# clf.fit(x, y)

# # Generate fallback response
# def check_intents_for_fallback(user_query, threshold=85):
#     best_score, best_response = 0, None
#     user_query_lower = user_query.lower()  # Convert user query to lowercase
    
#     for intent in intents:
#         # Normalize intent patterns to lowercase for matching
#         patterns_lower = [pattern.lower() for pattern in intent.get("patterns", [])]
#         match = process.extractOne(user_query_lower, patterns_lower)
        
#         if match:
#             matched_pattern, score = match[:2]
#             if score > best_score:
#                 best_score = score
#                 best_response = random.choice(intent.get("responses", []))

#     if best_score >= threshold:
#         return best_response
#     return "Sorry, I couldn't understand that. Could you rephrase?"

# def fetch_data_from_db(query, params=None):
#     """Fetch data from the database with improved error handling."""
#     try:
#         engine = sqlalchemy.create_engine(DATABASE_URL)
#         with engine.connect() as connection:
#             if params:
#                 result = pd.read_sql(query, connection, params=params)
#             else:
#                 result = pd.read_sql(query, connection)
#             return result
#     except Exception as e:
#         print(f"Database error: {str(e)}")  # Log the error for debugging
#         return f"Error fetching data from database: {str(e)}"

# def process_query(user_query):
#     """Process user query with improved error handling and SQL injection prevention."""
#     keywords = list(table_mapping.keys())
#     matched_keyword = find_closest_match(user_query.lower(), keywords)

#     if matched_keyword:
#         table_name = table_mapping[matched_keyword]
        
#         try:
#             # Use parametrized queries to prevent SQL injection
#             if "cutoff" in user_query.lower() and "department" in user_query.lower():
#                 # Extract department from user query
#                 dept_terms = ["it", "computer", "information", "mechanical", "civil", "electrical"]
#                 dept_query = None
                
#                 for term in dept_terms:
#                     if term in user_query.lower():
#                         dept_query = term
#                         break
                
#                 if dept_query:
#                     # Safer query using sqlalchemy text
#                     query = text(f"SELECT * FROM {table_name} WHERE LOWER(department_name) LIKE :dept")
#                     db_data = fetch_data_from_db(query, params={"dept": f"%{dept_query}%"})
#                 else:
#                     # Get all cutoff data
#                     query = text(f"SELECT * FROM {table_name}")
#                     db_data = fetch_data_from_db(query)
            
#             elif "hod" in user_query.lower() or "head" in user_query.lower():
#                 # For HOD queries, use the department_details table
#                 dept_terms = ["it", "computer", "information", "mechanical", "civil", "electrical"]
#                 dept_query = None
                
#                 for term in dept_terms:
#                     if term in user_query.lower():
#                         dept_query = term
#                         break
                
#                 table_name = "department_details"  # Force using the correct table
                
#                 if dept_query:
#                     query = text(f"SELECT * FROM {table_name} WHERE LOWER(department_name) LIKE :dept AND LOWER(position) LIKE '%hod%'")
#                     db_data = fetch_data_from_db(query, params={"dept": f"%{dept_query}%"})
#                 else:
#                     query = text(f"SELECT * FROM {table_name} WHERE LOWER(position) LIKE '%hod%'")
#                     db_data = fetch_data_from_db(query)
            
#             else:
#                 # Default query
#                 query = text(f"SELECT * FROM {table_name}")
#                 db_data = fetch_data_from_db(query)
            
#             if isinstance(db_data, str) and "Error" in db_data:
#                 return db_data
#             elif isinstance(db_data, pd.DataFrame) and db_data.empty:
#                 return check_intents_for_fallback(user_query)
            
#             # Generate an explanation using Gemini
#             data_summary = db_data.to_string(index=False)
#             prompt = f"""
#             Here is the data from the table {table_name}: {data_summary}. 
#             Answer the query: {user_query} in a little explantion manner depend upon the query otherwise not (dont mention table names, it will threat to database).
#             Here are some rules you should follow:
#             1. Do not mention the table name in the response.
#             2. Dont tell them you are using a database.
#             3. Dont tell you are Large langauge model tell them you are Sanjivani Chatbot.( if they asked )"""
#             explanation = ask_gemini(prompt)
            
#             #Provide ONLY the direct answer without describing the data structure or mentioning tables.
#             # Format the data as an HTML table with styling
#             styled_table = db_data.to_html(classes="data-table", index=False)
            
#             # Add CSS styling for the table directly in the response
#             styled_response = f"""
#             <div class="bot-response">
#                 <div class="explanation">{explanation}</div>
#                 <style>
#                     .data-table {{
#                         width: 100%;
#                         margin-top: 15px;
#                         border-collapse: collapse;
#                         font-size: 14px;
#                         background-color: white;
#                         border-radius: 8px;
#                         overflow: hidden;
#                         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
#                     }}

#                     .data-table th {{
#                         background-color: #007bff;
#                         color: white;
#                         padding: 10px;
#                         text-align: left;
#                         border: 1px solid #ddd;
#                         font-weight: bold;
#                     }}

#                     .data-table td {{
#                         padding: 10px;
#                         border: 1px solid #ddd;
#                         color: #333;
#                     }}

#                     .data-table tr:nth-child(even) {{
#                         background-color: #f1f1f1;
#                     }}

#                     .data-table tr:nth-child(odd) {{
#                         background-color: #ffffff;
#                     }}

#                     .data-table tr:hover {{
#                         background-color: #d0eaff;
#                     }}

#                     .explanation {{
#                         margin-bottom: 10px;
#                         color: #ffffff;
#                     }}

#                     /* Sky Blue Background Below the Table */
#                     .table-container {{
#                         padding: 20px;
#                         background: linear-gradient(to bottom, #ffffff, #87CEEB);
#                         border-radius: 10px;
#                         margin-top: 20px;
#                     }}
#                 </style>
#                 {styled_table}
#             </div>
#             """

#             return styled_response
#         except Exception as e:
#             print(f"Error in process_query: {str(e)}")  # Log the error
#             return f"I apologize, but I encountered an error processing your request: {str(e)}"

#     return check_intents_for_fallback(user_query)

# # Flask Routes
# @app.route("/")
# def home():
#     if "chat_history" not in session:
#         session["chat_history"] = []
#     return render_template("bot_entry.html", chat_history=session["chat_history"])

# @app.route("/index")
# def index_page():
#     if "chat_history" not in session:
#         session["chat_history"] = []
#     return render_template("index.html", chat_history=session["chat_history"])
# @app.route('/login')
# def login():
#     return render_template('login.html')  # Show login page
# @app.route("/get_response", methods=["POST"])
# def get_response():
#     user_input = request.json.get("user_input", "").strip()

#     if not user_input:
#         return jsonify({"response": "Please enter a valid message."})

#     user_input = user_input.lower()
#     response = process_query(user_input)

#     # Save conversation to session - store HTML content as is
#     timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#     chat_message = {"user": user_input, "bot": response, "timestamp": timestamp}
#     session["chat_history"].append(chat_message)

#     # For the CSV log, we should strip HTML tags for cleaner storage
#     plain_response = response
#     if "<table" in response:
#         # This is a simple way to indicate a table was included without storing the whole HTML
#         plain_response = response.split("<br><br>")[0] + " [Table data included]"
    
#     with open("chat_log.csv", "a", newline="", encoding="utf-8") as csvfile:
#         csv_writer = csv.writer(csvfile)
#         csv_writer.writerow([user_input, plain_response, timestamp])

#     return jsonify({"response": response, "has_table": "<table" in response})

# @app.route('/admin', methods=['GET'])
# def show_placements():
#     page = request.args.get('page', 1, type=int)  # Get the page number from the URL
#     per_page = 10  # Number of records per page
#     placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
#     print(placements)
#     return render_template('admin_panel.html', placements=placements)


# @app.route('/admin', methods=['POST'])
# def admin_panel_post():
#     """Handles POST requests for the Admin Panel"""
#     form_type = request.form.get('form_type')
#     if form_type == 'placement':
#         try:
#             # Create new placement record
#             new_placement = SanjivaniPlacementInfo(
#                 student_name=request.form['name_of_student'],
#                 batch=request.form['batch'],
#                 placement_type=request.form['placementtype'],
#                 name_of_company=request.form['company'],
#                 department=request.form['department']
#             )

#             # Add to session and commit
#             db.session.add(new_placement)
#             db.session.commit()

#             flash("Placement added successfully!", "success") 

#             # ✅ Query placement data correctly
#             page = request.args.get('page', 1, type=int)
#             per_page = 10
#             placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
    
#             return jsonify({"success": True, "message": "Placement added successfully!"})

#         except Exception as e:
#             page = request.args.get('page', 1, type=int)
#             per_page = 10
#             placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
#             return jsonify({"success": False, "error": "Invalid form submission"})
#     return render_template('admin_panel.html')


# @app.route('/admin/delete/<int:id>', methods=['DELETE'])
# def delete_placement(id):
#     try:
#         placement = SanjivaniPlacementInfo.query.get_or_404(id)
#         db.session.delete(placement)
#         db.session.commit()
#         return jsonify({"success": True, "message": "Record deleted successfully"})
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"success": False, "error": str(e)}), 500

# # New UPDATE endpoint
# @app.route('/admin/update/<int:id>', methods=['POST'])
# def update_placement(id):
#     try:
#         placement = SanjivaniPlacementInfo.query.get_or_404(id)
#         placement.student_name = request.json['name_of_student']
#         placement.batch = request.json['batch']
#         placement.placement_type = request.json['placementtype']
#         placement.name_of_company = request.json['company']
#         placement.department = request.json['department']

#         db.session.commit()

#         page = request.args.get('page', 1, type=int)
#         per_page = 10
#         placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
#         return jsonify({"success": True, "message": "Placement updated successfully!"}), 200
#     except Exception as e:
#         db.session.rollback()
#         page = request.args.get('page', 1, type=int)
#         per_page = 10
#         placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
#         return jsonify({"success": False, "error": str(e)}), 500  # Return JSON error response

# class SanjivaniPlacementInfo(db.Model):
#     __tablename__ = 'sanjivaniplacementinfo'
#     id = db.Column(db.Integer, primary_key=True)
#     student_name = db.Column(db.String(100), nullable=False)
#     batch = db.Column(db.String(20), nullable=False)
#     placement_type = db.Column(db.String(50), nullable=False)
#     name_of_company = db.Column(db.String(100), nullable=False)
#     department = db.Column(db.String(100), nullable=False)



# @app.route("/get_history", methods=["GET"])
# def get_history():
#     chat_history = session.get("chat_history", [])
#     return jsonify({"history": chat_history})

# @app.route("/about")
# def about():
#     return render_template("about.html")

# @app.route("/history")
# def conversation_history():
#     conversation = []
#     try:
#         with open("chat_log.csv", "r", encoding="utf-8") as csvfile:
#             csv_reader = csv.reader(csvfile)
#             next(csv_reader)  # Skip the header row
#             for row in csv_reader:
#                 conversation.append({"user": row[0], "bot": row[1], "timestamp": row[2]})
#     except FileNotFoundError:
#         conversation = None

#     return render_template("history.html", conversation=conversation)

# # Main entry point
# if __name__ == "__main__":
#     if not os.path.exists("chat_log.csv"):
#         with open("chat_log.csv", "w", newline="", encoding="utf-8") as csvfile:
#             csv_writer = csv.writer(csvfile)
#             csv_writer.writerow(["User Input", "Chatbot Response", "Timestamp"])

#     app.run(debug=True)



import os
import json
import random
import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pandas as pd
import google.generativeai as genai
from rapidfuzz import process
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sqlalchemy.exc import DatabaseError
from urllib.parse import quote_plus
# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")

#########################


# Configure SQLAlchemy for Azure MySQL
db_user = os.getenv("MYSQL_USER", "Nath")
db_password = quote_plus(os.getenv("MYSQL_PASSWORD", "Moonlight@123"))  # Encodes special characters
db_host = os.getenv("MYSQL_HOST", "chatbot-mysql-server.mysql.database.azure.com")
db_name = os.getenv("MYSQL_DATABASE", "collegedata")
ssl_ca_path = os.path.join(os.path.dirname(__file__), "DigiCertGlobalRootG2.crt.pem")

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    f"?ssl_ca={ssl_ca_path}&ssl_disabled=False"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

##################

# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "mysql+pymysql://root@localhost:3306/collegedata")
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'SimpleCache'  # In-memory cache for development

CORS(app, supports_credentials=True, origins=[os.getenv("FRONTEND_URL", "https://orange-dune-0aea0c81e.6.azurestaticapps.net")])
# db = SQLAlchemy(app)
cache = Cache(app)

# Initialize Limiter with correct syntax
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

# Gemini API configuration
def configure_gemini_api():
    """Configure the Gemini API client with environment variable key."""
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        return genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1000,
                "response_mime_type": "text/plain",
            },
        )
    except Exception as e:
        app.logger.error(f"Failed to configure Gemini API: {str(e)}")
        return None

chat_model = configure_gemini_api()
if not chat_model:
    raise RuntimeError("Gemini API configuration failed. Check API key.")

# Intent classification model (preloaded at startup)
class IntentClassifier:
    def __init__(self, intents_file="./intents.json"):
        self.vectorizer = TfidfVectorizer()
        self.clf = LogisticRegression(random_state=0, max_iter=10000)
        self.intents = []
        self._load_and_train(intents_file)

    def _load_and_train(self, intents_file):
        """Load intents from JSON and train the classifier."""
        try:
            with open(intents_file, "r") as file:
                self.intents = json.load(file)
            patterns, tags = [], []
            for intent in self.intents:
                for pattern in intent['patterns']:
                    patterns.append(pattern.lower())
                    tags.append(intent['tag'])
            if patterns:
                x = self.vectorizer.fit_transform(patterns)
                self.clf.fit(x, tags)
        except FileNotFoundError:
            app.logger.error(f"Intents file {intents_file} not found.")
            self.intents = []

    def classify(self, query, threshold=90):
        """Classify a query and return the best response if threshold is met."""
        query_lower = query.lower()
        best_score, best_response = 0, None
        for intent in self.intents:
            patterns_lower = [pattern.lower() for pattern in intent.get("patterns", [])]
            match = process.extractOne(query_lower, patterns_lower)
            if match:
                matched_pattern, score = match[:2]
                if score > best_score:
                    best_score = score
                    best_response = random.choice(intent.get("responses", []))
        if best_score >= threshold:
            return best_response
        return "Sorry, I couldn't understand that. Could you rephrase?"

intent_classifier = IntentClassifier()

# Database models
class SanjivaniPlacementInfo(db.Model):
    __tablename__ = 'sanjivaniplacementinfo'
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    batch = db.Column(db.String(20), nullable=False)
    placement_type = db.Column(db.String(50), nullable=False)
    name_of_company = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_name": self.student_name,
            "batch": self.batch,
            "placement_type": self.placement_type,
            "name_of_company": self.name_of_company,
            "department": self.department
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_input = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)

# Table mapping for query processing
table_mapping = {
    "placement": "sanjivaniplacementinfo",
    "admission": "admission_requirements",
    "department": "department_details",
    "cutoff": "admission_requirements",
    "score": "admission_requirements",
    "faculty": "department_details",
    "professor": "department_details",
    "fees": "admission_requirements",
    "intake": "admission_requirements",
}

def find_closest_match(query, options, threshold=50):
    """Find the closest matching keyword using fuzzy matching."""
    if not query or not options:
        return None
    closest_match = process.extractOne(query.lower(), options)
    if closest_match:
        match, score = closest_match[:2]
        return match if score >= threshold else None
    return None

@cache.memoize(timeout=300)  # Cache for 5 minutes
def ask_gemini(prompt):
    """Send a prompt to the Gemini API and return the response."""
    if not chat_model:
        return "Error: Gemini API is not configured."
    try:
        chat_session = chat_model.start_chat(history=[])
        response = chat_session.send_message(prompt)
        return response.text.strip()
    except Exception as e:
        app.logger.error(f"Gemini API error: {str(e)}")
        return f"Error with Gemini API: {str(e)}"

def process_query(user_query):
    """Process a user query and return a response from database or fallback."""
    if not user_query or not isinstance(user_query, str):
        return "Invalid query provided."

    keywords = list(table_mapping.keys())
    matched_keyword = find_closest_match(user_query.lower(), keywords)

    if matched_keyword:
        table_name = table_mapping[matched_keyword]
        try:
            # Use specific columns to reduce data transfer
            query = f"SELECT * FROM {table_name} LIMIT 50"  # Limit rows for performance
            db_data = pd.read_sql(query, db.engine)
            if db_data.empty:
                return intent_classifier.classify(user_query)

            # Structure data as JSON for better Gemini prompt
            data_json = db_data.to_dict(orient="records")
            prompt = (
                f"You are a helpful college chatbot. Based on the following data from the {table_name} table:\n"
                f"{json.dumps(data_json, indent=2)}\n\n"
                f"Answer the user's query in a concise, friendly, and accurate manner: {user_query}"
            )
            return ask_gemini(prompt)
        except DatabaseError as e:
            app.logger.error(f"Database error: {str(e)}")
            return f"Error fetching data: {str(e)}"

    return intent_classifier.classify(user_query)

@app.route("/get_response", methods=["POST"])
@limiter.limit("10 per minute")  # Rate limit to prevent abuse
def get_response():
    """Handle user queries and return chatbot responses."""
    data = request.get_json()
    user_input = data.get("user_input", "").strip()
    if not user_input:
        return jsonify({"response": "Please enter a valid message."}), 400

    response = process_query(user_input)
    timestamp = datetime.datetime.utcnow()

    # Store in session
    if 'chat_history' not in session:
        session['chat_history'] = []
    session['chat_history'].append({"user": user_input, "bot": response, "timestamp": timestamp.isoformat()})
    session.modified = True

    # Store in database
    try:
        chat_record = ChatHistory(user_input=user_input, bot_response=response, timestamp=timestamp)
        db.session.add(chat_record)
        db.session.commit()
    except DatabaseError as e:
        app.logger.error(f"Failed to save chat history: {str(e)}")
        db.session.rollback()

    return jsonify({"response": response})

@app.route('/admin', methods=['POST'])
def admin_panel_post():
    """Add a new placement record (requires authentication in production)."""
    data = request.get_json()
    form_type = data.get('form_type')
    if form_type != 'placement':
        return jsonify({"success": False, "message": "Invalid form type"}), 400

    try:
        placement = SanjivaniPlacementInfo(
            student_name=data['name_of_student'],
            batch=data['batch'],
            placement_type=data['placementtype'],
            name_of_company=data['company'],
            department=data['department']
        )
        db.session.add(placement)
        db.session.commit()
        return jsonify({"success": True, "message": "Placement added successfully"})
    except (KeyError, DatabaseError) as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/admin/delete/<int:id>', methods=['DELETE'])
def delete_placement(id):
    """Delete a placement record by ID."""
    try:
        placement = SanjivaniPlacementInfo.query.get_or_404(id)
        db.session.delete(placement)
        db.session.commit()
        return jsonify({"success": True, "message": "Record deleted successfully"})
    except DatabaseError as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/admin/update/<int:id>', methods=['POST'])
def update_placement(id):
    """Update a placement record by ID."""
    try:
        placement = SanjivaniPlacementInfo.query.get_or_404(id)
        data = request.get_json()
        placement.student_name = data['name_of_student']
        placement.batch = data['batch']
        placement.placement_type = data['placementtype']
        placement.name_of_company = data['company']
        placement.department = data['department']
        db.session.commit()
        return jsonify({"success": True, "message": "Placement updated successfully"})
    except (KeyError, DatabaseError) as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/placements', methods=['GET'])
def show_placements():
    """Retrieve paginated placement records."""
    page = request.args.get('page', 1, type=int)
    per_page = 10
    placements = SanjivaniPlacementInfo.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "items": [p.to_dict() for p in placements.items],
        "page": placements.page,
        "pages": placements.pages,
        "total": placements.total
    })

@app.route("/get_history", methods=["GET"])
def get_history():
    """Retrieve chat history from session."""
    chat_history = session.get("chat_history", [])
    return jsonify({"history": chat_history})

@app.route("/history", methods=["GET"])
def conversation_history():
    """Retrieve chat history from database."""
    try:
        history = ChatHistory.query.order_by(ChatHistory.timestamp.desc()).limit(100).all()
        return jsonify([{
            "user": h.user_input,
            "bot": h.bot_response,
            "timestamp": h.timestamp.isoformat()
        } for h in history])
    except DatabaseError as e:
        app.logger.error(f"Failed to fetch chat history: {str(e)}")
        return jsonify({"history": []}), 500

@app.route("/about")
def about():
    """Render the about page."""
    return render_template("about.html")

@app.route('/login')
def login():
    """Render the login page."""
    return render_template('login.html')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
    app.run(debug=True)