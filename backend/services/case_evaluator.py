
from typing import Dict, Any, List

class CaseEvaluator:
    """
    Basic case evaluation logic for Phase 1.
    """
    
    DOMAIN_KEYWORDS = {
        "Consumer Protection": ["defective", "service deficiency", "refund", "compensation", "consumer court"],
        "Contract Breach": ["breach", "violation", "agreement", "non-payment", "damages"],
        "Intellectual Property": ["copyright", "trademark", "patent", "infringement", "IPR"],
        "Criminal": ["police", "FIR", "arrest", "bail", "crime"],
        "Family": ["divorce", "custody", "maintenance", "alimony"]
    }

    def evaluate_case(self, case_facts: str) -> Dict[str, Any]:
        """
        Evaluates case facts to determine domain, strength, and strategy.
        """
        domain = self._identify_domain(case_facts)
        strength_score = self._calculate_strength(case_facts)
        strategy = self._generate_strategy(domain, strength_score)
        
        return {
            "domain": domain,
            "strength_score": strength_score,
            "win_probability": f"{strength_score}%",
            "recommended_strategy": strategy,
            "key_statutes": self._get_statutes(domain)
        }

    def _identify_domain(self, text: str) -> str:
        text_lower = text.lower()
        scores = {domain: 0 for domain in self.DOMAIN_KEYWORDS}
        
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[domain] += 1
        
        # Return domain with max score, default to "General Civil"
        best_domain = max(scores, key=scores.get)
        if scores[best_domain] == 0:
            return "General Civil"
        return best_domain

    def _calculate_strength(self, text: str) -> int:
        # Heuristic: More details (longer text) + specific keywords = higher strength
        # This is obviously a placeholder for real AI.
        length_score = min(len(text) // 10, 50) # Up to 50 points for length
        keyword_score = 0
        
        strong_words = ["evidence", "written", "agreement", "proof", "witness", "receipt"]
        weak_words = ["maybe", "think", "guess", "verbal", "unsure"]
        
        text_lower = text.lower()
        for word in strong_words:
            if word in text_lower:
                keyword_score += 10
        for word in weak_words:
            if word in text_lower:
                keyword_score -= 5
                
        total = length_score + keyword_score
        return max(10, min(total, 95)) # Clamp between 10 and 95

    def _generate_strategy(self, domain: str, score: int) -> str:
        if score > 70:
            return f"Strong case for {domain}. Proceed with legal notice and filing."
        elif score > 40:
            return f"Moderate case. Gather more evidence (receipts, agreements) before filing."
        else:
            return "Weak case. Consider negotiation or mediation. Documentation is lacking."

    def _get_statutes(self, domain: str) -> List[str]:
        mapping = {
            "Consumer Protection": ["Consumer Protection Act, 2019", "Sale of Goods Act"],
            "Contract Breach": ["Indian Contract Act, 1872", "Specific Relief Act"],
            "Intellectual Property": ["Copyright Act, 1957", "Trade Marks Act, 1999"],
            "Criminal": ["Bharatiya Nyaya Sanhita (BNS)", "Bharatiya Nagarik Suraksha Sanhita (BNSS)"],
            "Family": ["Hindu Marriage Act, 1955", "Special Marriage Act, 1954"],
            "General Civil": ["Code of Civil Procedure", "Specific Relief Act"]
        }
        return mapping.get(domain, [])
