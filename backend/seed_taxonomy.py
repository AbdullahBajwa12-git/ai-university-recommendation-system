import asyncio
import sys
from database import init_db
from models import ALL_MODELS, AcademicDomain, CoreProgram, Specialization

TAXONOMY = {
    "STEM": {
        "Computer Science": {
            "aliases": ["CS", "Comp Sci", "Computing", "Information Technology", "IT"],
            "specializations": {
                "Software Engineering": ["SWE", "Software Dev"],
                "Cybersecurity": ["Information Security", "InfoSec"],
                "Cloud Computing": ["Cloud Architecture"]
            }
        },
        "Artificial Intelligence": {
            "aliases": ["AI", "Machine Learning", "ML", "Deep Learning"],
            "specializations": {
                "Natural Language Processing": ["NLP"],
                "Computer Vision": ["CV"]
            }
        },
        "Data Science": {
            "aliases": ["Data Analytics", "Big Data", "Data Engineering"],
            "specializations": {
                "Business Analytics": ["Business Intelligence", "BI"]
            }
        }
    },
    "Business": {
        "Business Administration": {
            "aliases": ["Business", "MBA", "Business Management", "Management", "BBA"],
            "specializations": {
                "International Business": ["Global Business"],
                "Entrepreneurship": ["Startup Management"]
            }
        },
        "Finance": {
            "aliases": ["Fin", "Accounting", "Corporate Finance"],
            "specializations": {
                "Investment Banking": [],
                "Financial Technology": ["FinTech"]
            }
        },
        "Marketing": {
            "aliases": ["Digital Marketing", "PR", "Public Relations"],
            "specializations": {
                "Brand Management": [],
                "SEO & Content": []
            }
        }
    },
    "Engineering": {
        "General Engineering": {
            "aliases": ["Engineering", "General Eng"],
            "specializations": {}
        },
        "Mechanical Engineering": {
            "aliases": ["Mech Eng", "ME"],
            "specializations": {
                "Robotics": ["Mechatronics"],
                "Automotive Engineering": []
            }
        },
        "Electrical Engineering": {
            "aliases": ["EE", "Electrical", "Electronics"],
            "specializations": {
                "Power Systems": [],
                "Telecommunications": []
            }
        },
        "Civil Engineering": {
            "aliases": ["CE", "Civil"],
            "specializations": {
                "Structural Engineering": [],
                "Construction Management": []
            }
        }
    },
    "Medicine": {
        "Medicine": {
            "aliases": ["MBBS", "MD", "Medical", "Pre-Med"],
            "specializations": {
                "Surgery": ["General Surgery"],
                "Pediatrics": ["Child Health"],
                "Internal Medicine": []
            }
        },
        "Nursing": {
            "aliases": ["BSN", "Registered Nurse", "RN"],
            "specializations": {
                "Critical Care Nursing": []
            }
        }
    },
    "Law": {
        "Law": {
            "aliases": ["LLB", "JD", "Legal Studies", "LLM", "Juris Doctor"],
            "specializations": {
                "International Law": [],
                "Corporate Law": ["Business Law"],
                "Criminal Law": []
            }
        }
    },
    "Arts": {
        "Design": {
            "aliases": ["Graphic Design", "Industrial Design", "UX/UI", "Product Design"],
            "specializations": {
                "User Experience": ["UX"],
                "Visual Arts": []
            }
        }
    },
    "Social Sciences": {
        "Psychology": {
            "aliases": ["Psych", "Behavioral Science", "Clinical Psychology"],
            "specializations": {
                "Cognitive Psychology": [],
                "Counseling": []
            }
        },
        "Economics": {
            "aliases": ["Econ", "Applied Economics"],
            "specializations": {
                "Microeconomics": [],
                "Macroeconomics": []
            }
        }
    },
    "Humanities": {
        "History": {
            "aliases": ["Historical Studies"],
            "specializations": {
                "Modern History": [],
                "Ancient History": []
            }
        }
    }
}

async def seed_taxonomy():
    await init_db(models=ALL_MODELS)

    stats = {
        "domains_inserted": 0,
        "domains_updated": 0,
        "cores_inserted": 0,
        "cores_updated": 0,
        "specs_inserted": 0,
        "specs_updated": 0
    }

    for domain_name, core_programs in TAXONOMY.items():
        domain = await AcademicDomain.find_one(AcademicDomain.name == domain_name)
        if not domain:
            domain = AcademicDomain(name=domain_name)
            await domain.insert()
            stats["domains_inserted"] += 1
        else:
            stats["domains_updated"] += 1

        for core_name, core_data in core_programs.items():
            core = await CoreProgram.find_one(CoreProgram.canonical_name == core_name)
            aliases = [a.lower() for a in core_data["aliases"]]
            if not core:
                core = CoreProgram(domain=domain, canonical_name=core_name, aliases=aliases)
                await core.insert()
                stats["cores_inserted"] += 1
            else:
                core.domain = domain
                core.aliases = aliases
                await core.save()
                stats["cores_updated"] += 1

            for spec_name, spec_aliases in core_data.get("specializations", {}).items():
                spec = await Specialization.find_one(
                    Specialization.core_program.id == core.id,
                    Specialization.name == spec_name
                )
                spec_aliases_lower = [a.lower() for a in spec_aliases]
                if not spec:
                    spec = Specialization(core_program=core, name=spec_name, aliases=spec_aliases_lower)
                    await spec.insert()
                    stats["specs_inserted"] += 1
                else:
                    spec.aliases = spec_aliases_lower
                    await spec.save()
                    stats["specs_updated"] += 1

    print("=== SEED STATS ===")
    print(f"Domains Inserted: {stats['domains_inserted']}")
    print(f"Domains Updated: {stats['domains_updated']}")
    print(f"Core Programs Inserted: {stats['cores_inserted']}")
    print(f"Core Programs Updated: {stats['cores_updated']}")
    print(f"Specializations Inserted: {stats['specs_inserted']}")
    print(f"Specializations Updated: {stats['specs_updated']}")

    # Final counts
    d_count = await AcademicDomain.count()
    c_count = await CoreProgram.count()
    s_count = await Specialization.count()
    print("\n=== FINAL DB COUNTS ===")
    print(f"Domains: {d_count}")
    print(f"Core Programs: {c_count}")
    print(f"Specializations: {s_count}")

if __name__ == "__main__":
    asyncio.run(seed_taxonomy())
