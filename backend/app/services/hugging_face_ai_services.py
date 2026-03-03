import os
import requests
from typing import Dict, Optional

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/"

# Using Mistral-7B-Instruct (free, fast, good quality)
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"


def query_huggingface(payload: dict, model: str = MODEL_ID) -> dict:
    """Query Hugging Face Inference API"""
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

    response = requests.post(
        f"{HUGGINGFACE_API_URL}{model}",
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code == 503:
        # Model is loading, wait and retry
        import time
        time.sleep(20)
        response = requests.post(
            f"{HUGGINGFACE_API_URL}{model}",
            headers=headers,
            json=payload,
            timeout=60
        )

    return response.json()


def generate_cover_letter(
        job_title: str,
        company: str,
        job_description: str,
        user_experience: str = ""
) -> str:
    """Generate a professional cover letter using Hugging Face AI"""

    prompt = f"""<s>[INST] You are a professional career counselor. Write a compelling cover letter for this job application.

Job Title: {job_title}
Company: {company}
Job Description: {job_description}
Applicant's Experience: {user_experience if user_experience else "Entry-level candidate"}

Write a professional cover letter (300-400 words) that:
1. Opens with enthusiasm for the specific role
2. Highlights relevant skills matching the job description
3. Shows knowledge of the company
4. Demonstrates value the candidate brings
5. Closes with a call to action

Format it professionally with [Your Name], [Date], and [Hiring Manager] placeholders. [/INST]"""

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 800,
                "temperature": 0.7,
                "top_p": 0.95,
                "do_sample": True,
            }
        }

        result = query_huggingface(payload)

        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "")
            # Remove the prompt from the response
            if "[/INST]" in generated_text:
                cover_letter = generated_text.split("[/INST]")[1].strip()
            else:
                cover_letter = generated_text

            return cover_letter if cover_letter else "Error: Empty response from AI"
        else:
            error_msg = result.get("error", "Unknown error")
            return f"Error generating cover letter: {error_msg}"

    except Exception as e:
        print(f"Hugging Face API Error: {e}")
        return f"Error: {str(e)}"


def generate_resume_suggestions(
        job_description: str,
        current_resume: str
) -> Dict:
    """Analyze resume and provide ATS optimization suggestions"""

    prompt = f"""<s>[INST] You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description.

Job Description:
{job_description[:500]}

Resume:
{current_resume[:800]}

Provide:
1. ATS Score (0-100)
2. Top 5 missing keywords
3. Top 3 improvement suggestions
4. Top 2 strengths

Keep your response concise and actionable. [/INST]"""

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.5,
                "top_p": 0.9,
            }
        }

        result = query_huggingface(payload)

        if isinstance(result, list) and len(result) > 0:
            analysis = result[0].get("generated_text", "")
            if "[/INST]" in analysis:
                analysis = analysis.split("[/INST]")[1].strip()

            # Try to extract ATS score
            ats_score = 75  # Default
            if "ATS Score:" in analysis or "Score:" in analysis:
                import re
                score_match = re.search(r'(\d{1,3})', analysis)
                if score_match:
                    ats_score = int(score_match.group(1))

            return {
                "analysis": analysis,
                "ats_score": min(100, max(0, ats_score)),
                "suggestions": analysis.split('\n')[:5],
                "success": True
            }
        else:
            return {
                "error": "Could not analyze resume",
                "ats_score": 0,
                "suggestions": [],
                "success": False
            }

    except Exception as e:
        return {
            "error": str(e),
            "ats_score": 0,
            "suggestions": [],
            "success": False
        }


def optimize_resume_bullet_point(bullet_point: str, job_keywords: list) -> str:
    """Optimize a single resume bullet point with keywords"""

    keywords_str = ", ".join(job_keywords[:5])

    prompt = f"""<s>[INST] Rewrite this resume bullet point to include relevant keywords while keeping it truthful and impactful.

Original: {bullet_point}
Keywords to incorporate: {keywords_str}

Rewrite the bullet point to be ATS-friendly. Keep it to 1-2 lines. [/INST]"""

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 150,
                "temperature": 0.6,
            }
        }

        result = query_huggingface(payload)

        if isinstance(result, list) and len(result) > 0:
            optimized = result[0].get("generated_text", "")
            if "[/INST]" in optimized:
                optimized = optimized.split("[/INST]")[1].strip()
            return optimized if optimized else bullet_point

        return bullet_point

    except Exception as e:
        print(f"Optimization error: {e}")
        return bullet_point
