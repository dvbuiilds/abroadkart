import Image from "next/image";
import { Card, CardContent } from "@app/components/ui/card";
import { Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Get in Touch with Us</h1>
      <Image
        src="https://images.unsplash.com/photo-1568992687947-868a62a9f521"
        alt="contact abroadkart delhi office to counselling or b2b queries"
        width={1000}
        height={500}
        priority
        className="mx-auto"
      />
      <p className="text-center text-gray-600">
        Have questions about studying abroad? Need expert guidance on
        universities, visas, or scholarships? We're here to help!
      </p>

      {/* Contact Info */}
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600" />
            <p>E-11, Sector-1, Rohini, Avantika, New Delhi - 110085</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" />
            <p>info@abroadkart.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
